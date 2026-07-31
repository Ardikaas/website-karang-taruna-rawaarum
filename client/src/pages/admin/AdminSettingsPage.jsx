import { useState, useEffect } from 'react';
import {
  changePassword,
  fetchSiteSettings,
  updateSiteSettings,
  uploadImage,
  fetchPengurus,
} from '../../services/api';
import { getAvatarPhoto } from '../../constants/structureData';
import { compressImageIfNeeded } from '../../utils/imageCompressor';

const BIRTHDAY_TEMPLATE_MESSAGES = [
  'Selamat Ulang Tahun! Semoga bertambahnya usia membawa keberkahan, kesehatan yang prima, serta kemudahan dalam setiap niat baik. Terima kasih atas dedikasi dan kontribusi nyata dalam memajukan pemuda Kelurahan Rawa Arum.',
  'Barakallah fii umrik. Semoga Allah SWT senantiasa melimpahkan kesehatan, umur yang panjang dan penuh manfaat, serta melapangkan rezeki dan memberikan kemudahan dalam setiap karya dan pengabdian bagi masyarakat.',
  'Selamat Ulang Tahun! Semoga senantiasa diberikan kekuatan, kebahagiaan, dan inspirasi dalam melangkah. Terima kasih atas semangat kebersamaan dan kepemimpinan yang senantiasa membawa Karang Taruna Rawa Arum menjadi lebih solid.',
  'Selamat bertambah usia! Semoga panjang umur, sehat selalu, dan dipermudah segala langkah dalam meraih cita-cita. Semoga senantiasa menjadi pribadi yang menginspirasi dan membawa kemajuan bagi lingkungan Rawa Arum.',
  'Selamat Ulang Tahun! Selamat merayakan bertambahnya usia dengan penuh rasa syukur. Semoga senantiasa dilimpahi kebahagiaan bersama keluarga tercinta dan terus bersemangat dalam menebar manfaat bagi sesama.',
];

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'security' | 'contact' | 'visimisi'
  const [pengurusList, setPengurusList] = useState([]);

  // ── Password Form State ──
  const [passForm, setPassForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passSubmitting, setPassSubmitting] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // ── Site Settings State ──
  const [settings, setSettings] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    heroSlides: [],
    visiText: '',
    misiList: [],
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    mapsEmbedUrl: '',
    socialInstagram: '',
    socialFacebook: '',
    socialYoutube: '',
    birthdayAnnouncement: {
      isActive: false,
      name: '',
      role: '',
      photoUrl: '',
      message:
        'Selamat Ulang Tahun! Semoga bertambahnya usia membawa keberkahan dan kesehatan.',
      whatsapp: '',
    },
  });

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [uploadingSlideIdx, setUploadingSlideIdx] = useState(null);
  const [uploadingBirthdayPhoto, setUploadingBirthdayPhoto] = useState(false);

  // Load site settings & pengurus list on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setSettingsLoading(true);
        const [data, pengurusData] = await Promise.all([
          fetchSiteSettings(),
          fetchPengurus().catch(() => []),
        ]);

        if (Array.isArray(pengurusData)) {
          setPengurusList(pengurusData);
        }

        setSettings({
          heroTitle: data.heroTitle || '',
          heroSubtitle: data.heroSubtitle || '',
          heroDescription: data.heroDescription || '',
          heroSlides: data.heroSlides || [],
          visiText: data.visiText || '',
          misiList: data.misiList || [],
          address: data.address || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          mapsEmbedUrl: data.mapsEmbedUrl || '',
          socialInstagram: data.socialInstagram || '',
          socialFacebook: data.socialFacebook || '',
          socialYoutube: data.socialYoutube || '',
          birthdayAnnouncement: data.birthdayAnnouncement || {
            isActive: false,
            name: '',
            role: '',
            photoUrl: '',
            message:
              'Selamat Ulang Tahun! Semoga bertambahnya usia membawa keberkahan dan kesehatan.',
            whatsapp: '',
          },
        });
      } catch (_err) {
        setSettingsError('Gagal memuat pengaturan situs.');
      } finally {
        setSettingsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // ── Handle Password Submission ──
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passForm.newPassword.length < 6) {
      setPassError('Password baru minimal harus 6 karakter.');
      return;
    }

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setPassSubmitting(true);

    try {
      await changePassword(passForm.oldPassword, passForm.newPassword);
      setPassSuccess('Password berhasil diperbarui!');
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassError(
        err.message ||
          'Gagal merubah password. Pastikan password lama Anda benar.'
      );
    } finally {
      setPassSubmitting(false);
    }
  };

  // ── Handle Settings Submission ──
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    // Validation for Birthday Announcement Tab
    if (activeTab === 'birthday') {
      const bday = settings.birthdayAnnouncement;
      if (!bday?.name || bday.name.trim() === '') {
        setSettingsError(
          'Harap pilih Anggota Pengurus yang ulang tahun terlebih dahulu!'
        );
        return;
      }
      if (!bday?.message || bday.message.trim() === '') {
        setSettingsError(
          'Harap pilih Template Doa / Ucapan Ulang Tahun terlebih dahulu!'
        );
        return;
      }
    }

    setSettingsSubmitting(true);

    try {
      // Ensure heroSlides image property is a clean string URL, not an object
      const sanitizedSlides = (settings.heroSlides || []).map((slide) => {
        let img = slide.image;
        if (typeof img === 'object' && img !== null) {
          img = img.imageUrl || img.url || '';
        }
        return {
          ...slide,
          image: String(img || ''),
        };
      });

      const payload = {
        ...settings,
        heroSlides: sanitizedSlides,
      };

      const updated = await updateSiteSettings(payload);
      setSettingsSuccess('Pengaturan berhasil diperbarui dan disimpan!');
      setSettings({
        ...updated,
        heroSlides: updated.heroSlides || [],
      });
    } catch (err) {
      setSettingsError(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSettingsSubmitting(false);
    }
  };

  // ── Slide Handlers ──
  const handleSlideChange = (index, field, value) => {
    const updatedSlides = [...settings.heroSlides];
    updatedSlides[index] = {
      ...updatedSlides[index],
      [field]: value,
    };
    setSettings({ ...settings, heroSlides: updatedSlides });
  };

  const handleSlideImageUpload = async (index, file) => {
    if (!file) return;
    try {
      setUploadingSlideIdx(index);
      const res = await uploadImage(file);
      const imageUrl =
        typeof res === 'string' ? res : res?.imageUrl || res?.url || '';
      handleSlideChange(index, 'image', imageUrl);
    } catch (err) {
      alert(err.message || 'Gagal mengunggah gambar slide.');
    } finally {
      setUploadingSlideIdx(null);
    }
  };

  const addSlide = () => {
    const newSlide = {
      image: '',
      title: '',
      subtitle: '',
    };
    setSettings({
      ...settings,
      heroSlides: [...settings.heroSlides, newSlide],
    });
  };

  const removeSlide = (index) => {
    const updatedSlides = settings.heroSlides.filter((_, i) => i !== index);
    setSettings({ ...settings, heroSlides: updatedSlides });
  };

  // ── Misi Handlers ──
  const handleMisiChange = (index, value) => {
    const newList = [...settings.misiList];
    newList[index] = value;
    setSettings({ ...settings, misiList: newList });
  };

  const addMisiItem = () => {
    setSettings({ ...settings, misiList: [...settings.misiList, ''] });
  };

  const removeMisiItem = (index) => {
    const newList = settings.misiList.filter((_, i) => i !== index);
    setSettings({ ...settings, misiList: newList });
  };

  const handleUploadBirthdayPhoto = async (e) => {
    const rawFile = e.target.files[0];
    if (!rawFile) return;

    setUploadingBirthdayPhoto(true);
    try {
      const file = await compressImageIfNeeded(rawFile, 1.5);
      const res = await uploadImage(file);
      const uploadedUrl =
        typeof res === 'string' ? res : res?.imageUrl || res?.url || '';
      if (uploadedUrl) {
        setSettings((prev) => ({
          ...prev,
          birthdayAnnouncement: {
            ...prev.birthdayAnnouncement,
            photoUrl: uploadedUrl,
          },
        }));
      }
    } catch (_err) {
      setSettingsError('Gagal mengunggah foto ulang tahun.');
    } finally {
      setUploadingBirthdayPhoto(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="admin-loading-container">
        <i className="fa-solid fa-spinner fa-spin admin-spinner" />
        <p>Memuat pengaturan situs...</p>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Pengaturan Website & Akun</h1>
          <p className="admin-page-subtitle">
            Kelola Hero Banner, pengumuman ulang tahun, kontak, dan keamanan
            akun.
          </p>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div
        className="admin-tabs"
        style={{ borderBottom: '1px solid #edf2f7', marginBottom: '1.5rem' }}
      >
        <button
          className={`admin-tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          <i className="fa-solid fa-images" /> Menu Hero Banner
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'birthday' ? 'active' : ''}`}
          onClick={() => setActiveTab('birthday')}
        >
          <i
            className="fa-solid fa-cake-candles"
            style={{ color: '#f97316' }}
          />{' '}
          Pengumuman Ulang Tahun
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'visimisi' ? 'active' : ''}`}
          onClick={() => setActiveTab('visimisi')}
        >
          <i className="fa-solid fa-bullseye" /> Visi & Misi
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <i className="fa-solid fa-address-book" /> Kontak & Footer
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <i className="fa-solid fa-shield-halved" /> Keamanan Akun
        </button>
      </div>

      {/* ── TAB 1: HERO BANNER MANAGEMENT ── */}
      {activeTab === 'hero' && (
        <form onSubmit={handleSettingsSubmit}>
          <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
            <div className="admin-card__header">
              <h2 className="admin-card__title">
                <i className="fa-solid fa-heading" /> Pengaturan Teks Utama Hero
                Banner
              </h2>
            </div>
            <div className="admin-card__body">
              {settingsError && (
                <div
                  className="admin-alert admin-alert--error"
                  style={{ marginBottom: '1.5rem' }}
                >
                  <i className="fa-solid fa-circle-exclamation" />
                  <span>{settingsError}</span>
                </div>
              )}

              {settingsSuccess && (
                <div
                  className="admin-alert"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    marginBottom: '1.5rem',
                  }}
                >
                  <i className="fa-solid fa-circle-check" />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              <div className="admin-form-group">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <label className="admin-form-label">
                    Judul Utama Banner (Hero Title)
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {settings.heroTitle.length}/60
                  </span>
                </div>
                <input
                  type="text"
                  className="admin-form-control"
                  maxLength={60}
                  placeholder="KARANG TARUNA KELURAHAN RAWA ARUM"
                  value={settings.heroTitle}
                  onChange={(e) =>
                    setSettings({ ...settings, heroTitle: e.target.value })
                  }
                />
              </div>

              <div className="admin-form-group">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <label className="admin-form-label">
                    Tagline / Highlight Teks
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {settings.heroSubtitle.length}/80
                  </span>
                </div>
                <input
                  type="text"
                  className="admin-form-control"
                  required
                  maxLength={80}
                  placeholder="Muda, Beda, Berkarya untuk Kemajuan Rawa Arum"
                  value={settings.heroSubtitle}
                  onChange={(e) =>
                    setSettings({ ...settings, heroSubtitle: e.target.value })
                  }
                />
              </div>

              <div className="admin-form-group">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <label className="admin-form-label">
                    Deskripsi Pengantar Utama Beranda
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {settings.heroDescription.length}/200
                  </span>
                </div>
                <textarea
                  className="admin-form-control"
                  rows="3"
                  required
                  maxLength={200}
                  placeholder="Deskripsi singkat pengantar..."
                  value={settings.heroDescription}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      heroDescription: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Slides Manager Card */}
          <div className="admin-card">
            <div
              className="admin-card__header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 className="admin-card__title">
                <i className="fa-solid fa-images" /> Kelola Gambar & Slide Hero
                Banner ({settings.heroSlides.length} Slide Kustom)
              </h2>
              <button
                type="button"
                className="admin-btn admin-btn--outline admin-btn--sm"
                onClick={addSlide}
              >
                <i className="fa-solid fa-plus" /> Tambah Slide Baru
              </button>
            </div>
            <div className="admin-card__body">
              {settings.heroSlides.length === 0 ? (
                <div
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    color: '#1d4ed8',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    padding: '1.25rem',
                    borderRadius: '8px',
                    lineHeight: '1.6',
                  }}
                >
                  <p style={{ margin: 0, fontWeight: '600' }}>
                    <i
                      className="fa-solid fa-circle-info"
                      style={{ marginRight: '0.5rem' }}
                    />
                    Belum ada slide kustom. Website saat ini secara otomatis
                    menampilkan <strong>3 slide default/dummy</strong>.
                  </p>

                  <p
                    style={{
                      margin: '0.5rem 0 0',
                      fontSize: '0.88rem',
                      opacity: 0.9,
                    }}
                  >
                    Klik tombol <strong>"+ Tambah Slide Baru"</strong> di atas
                    jika Anda ingin menambahkan slide kustom khusus. Jika ada 1
                    atau lebih slide kustom yang diisi, website akan secara
                    otomatis menampilkan slide kustom tersebut saja.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                  }}
                >
                  {settings.heroSlides.map((slide, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '1.25rem',
                        backgroundColor: '#f8fafc',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '1rem',
                          paddingBottom: '0.5rem',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: '800',
                            color: 'var(--primary-deep)',
                          }}
                        >
                          Slide Kustom #{idx + 1}
                        </span>
                        <button
                          type="button"
                          className="admin-btn-delete-slide"
                          onClick={() => removeSlide(idx)}
                        >
                          <i className="fa-solid fa-trash-can" /> Hapus Slide
                        </button>
                      </div>

                      <div className="admin-grid-2" style={{ gap: '1.25rem' }}>
                        {/* Left: Image Upload & Preview */}
                        <div>
                          <label className="admin-form-label">
                            Gambar Slide
                          </label>
                          <div
                            style={{
                              height: '140px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              backgroundColor: '#0b2545',
                              backgroundImage: slide.image
                                ? `url(${slide.image})`
                                : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              marginBottom: '0.75rem',
                              border: '1px solid #cbd5e1',
                            }}
                          />
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.5rem',
                              alignItems: 'center',
                            }}
                          >
                            <input
                              type="file"
                              id={`slide-file-${idx}`}
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) =>
                                handleSlideImageUpload(idx, e.target.files[0])
                              }
                            />
                            <label
                              htmlFor={`slide-file-${idx}`}
                              className="admin-btn admin-btn--outline admin-btn--sm"
                              style={{ cursor: 'pointer' }}
                            >
                              {uploadingSlideIdx === idx ? (
                                <>
                                  <i className="fa-solid fa-spinner fa-spin" />{' '}
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <i className="fa-solid fa-upload" /> Unggah
                                  Gambar
                                </>
                              )}
                            </label>
                            <input
                              type="text"
                              className="admin-form-control"
                              style={{ fontSize: '0.82rem' }}
                              placeholder="atau paste URL Gambar..."
                              value={slide.image}
                              onChange={(e) =>
                                handleSlideChange(idx, 'image', e.target.value)
                              }
                            />
                          </div>
                        </div>

                        {/* Right: Slide Text Fields */}
                        <div>
                          <div className="admin-form-group">
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <label className="admin-form-label">
                                Judul Slide (Kartu Highlight)
                              </label>
                              <span
                                style={{
                                  fontSize: '0.78rem',
                                  color: '#64748b',
                                }}
                              >
                                {(slide.title || '').length}/60
                              </span>
                            </div>
                            <input
                              type="text"
                              className="admin-form-control"
                              required
                              maxLength={60}
                              placeholder="Ketik judul slide di sini (contoh: Pemberdayaan UMKM Pemuda)..."
                              value={slide.title}
                              onChange={(e) =>
                                handleSlideChange(idx, 'title', e.target.value)
                              }
                            />
                          </div>

                          <div className="admin-form-group">
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <label className="admin-form-label">
                                Deskripsi / Subtitle Slide
                              </label>
                              <span
                                style={{
                                  fontSize: '0.78rem',
                                  color: '#64748b',
                                }}
                              >
                                {(slide.subtitle || '').length}/150
                              </span>
                            </div>
                            <textarea
                              className="admin-form-control"
                              rows="3"
                              required
                              maxLength={150}
                              placeholder="Ketik deskripsi singkat slide di sini..."
                              value={slide.subtitle}
                              onChange={(e) =>
                                handleSlideChange(
                                  idx,
                                  'subtitle',
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '2rem' }}>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={settingsSubmitting}
                >
                  {settingsSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" /> Menyimpan...
                    </>
                  ) : (
                    'Simpan Semua Pengaturan Hero Banner'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ── TAB: PENGUMUMAN ULANG TAHUN ── */}
      {activeTab === 'birthday' && (
        <form onSubmit={handleSettingsSubmit}>
          <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
            <div className="admin-card__header">
              <h2 className="admin-card__title">
                <i
                  className="fa-solid fa-cake-candles"
                  style={{ color: '#f97316' }}
                />{' '}
                Pengaturan Pengumuman Ulang Tahun (Manual Admin)
              </h2>
            </div>
            <div className="admin-card__body">
              {settingsError && (
                <div
                  className="admin-alert admin-alert--error"
                  style={{ marginBottom: '1.5rem' }}
                >
                  <i className="fa-solid fa-circle-exclamation" />
                  <span>{settingsError}</span>
                </div>
              )}

              {settingsSuccess && (
                <div
                  className="admin-alert admin-alert--success"
                  style={{ marginBottom: '1.5rem' }}
                >
                  <i className="fa-solid fa-circle-check" />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              {/* Status Switch Toggle (Modern iOS Pill Toggle) */}
              <div
                style={{
                  background: settings.birthdayAnnouncement?.isActive
                    ? '#f0fdf4'
                    : '#f8fafc',
                  border: `1px solid ${settings.birthdayAnnouncement?.isActive ? '#bbf7d0' : '#e2e8f0'}`,
                  borderRadius: '14px',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  transition: 'all 0.3s ease',
                }}
              >
                <div>
                  <strong
                    style={{
                      fontSize: '1.05rem',
                      color: '#0f172a',
                      display: 'block',
                      marginBottom: '0.2rem',
                    }}
                  >
                    Status Banner Ulang Tahun di Beranda
                  </strong>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      color: settings.birthdayAnnouncement?.isActive
                        ? '#15803d'
                        : '#64748b',
                      fontWeight: 600,
                    }}
                  >
                    {settings.birthdayAnnouncement?.isActive
                      ? 'BANNER AKTIF: Kartu ucapan ulang tahun sedang tampil di Beranda Publik.'
                      : 'BANNER NONAKTIF: Kartu ucapan ulang tahun tersembunyi dari Beranda.'}
                  </span>
                </div>

                <div
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      birthdayAnnouncement: {
                        ...prev.birthdayAnnouncement,
                        isActive: !prev.birthdayAnnouncement?.isActive,
                      },
                    }))
                  }
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: '#ffffff',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '50px',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: settings.birthdayAnnouncement?.isActive
                        ? '#16a34a'
                        : '#64748b',
                    }}
                  >
                    {settings.birthdayAnnouncement?.isActive
                      ? 'Banner Aktif'
                      : 'Banner Nonaktif'}
                  </span>

                  <div
                    style={{
                      width: '52px',
                      height: '28px',
                      borderRadius: '30px',
                      background: settings.birthdayAnnouncement?.isActive
                        ? '#16a34a'
                        : '#cbd5e1',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transform: settings.birthdayAnnouncement?.isActive
                          ? 'translateX(24px)'
                          : 'translateX(0px)',
                        transition:
                          'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Select Member & Template Bar */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                <h4
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: 'var(--primary-deep)',
                    marginBottom: '0.85rem',
                  }}
                >
                  <i
                    className="fa-solid fa-bolt"
                    style={{ color: '#f97316', marginRight: '6px' }}
                  />{' '}
                  Cepat: Pilih Pengurus / Anggota &amp; Template Ucapan
                </h4>

                <div className="admin-grid-2">
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label className="admin-form-label">
                      Pilih Dari Daftar Pengurus Karang Taruna:
                    </label>
                    <select
                      className="admin-form-control"
                      onChange={(e) => {
                        const selectedIdx = e.target.value;
                        if (selectedIdx !== '') {
                          const item = pengurusList[selectedIdx];
                          if (item) {
                            const photo =
                              item.imageUrl ||
                              item.photoUrl ||
                              getAvatarPhoto(item.name);
                            const roleText = item.role
                              ? item.bidangTitle &&
                                !item.role.includes(item.bidangTitle)
                                ? `${item.role} - ${item.bidangTitle}`
                                : item.role
                              : item.bidangTitle || 'Pengurus Karang Taruna';

                            setSettings((prev) => ({
                              ...prev,
                              birthdayAnnouncement: {
                                ...prev.birthdayAnnouncement,
                                name: item.name,
                                role: roleText,
                                photoUrl: photo,
                                whatsapp:
                                  item.whatsapp ||
                                  prev.birthdayAnnouncement?.whatsapp ||
                                  '',
                              },
                            }));
                          }
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">
                        {pengurusList.length > 0
                          ? `-- Pilih Anggota Pengurus (${pengurusList.length} Orang Terdaftar) --`
                          : '-- Memuat Daftar Pengurus... --'}
                      </option>
                      {pengurusList.map((item, idx) => {
                        const roleLabel = item.bidangTitle
                          ? `${item.role || 'Anggota'} - ${item.bidangTitle}`
                          : item.role || 'Pengurus';
                        return (
                          <option key={item._id || idx} value={idx}>
                            {item.name} ({roleLabel})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label className="admin-form-label">
                      Pilih Template Doa / Ucapan Ulang Tahun:
                    </label>
                    <select
                      className="admin-form-control"
                      onChange={(e) => {
                        const selectedMsg = e.target.value;
                        if (selectedMsg) {
                          setSettings((prev) => ({
                            ...prev,
                            birthdayAnnouncement: {
                              ...prev.birthdayAnnouncement,
                              message: selectedMsg,
                            },
                          }));
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">-- Pilih Template Ucapan --</option>
                      {BIRTHDAY_TEMPLATE_MESSAGES.map((msg, idx) => (
                        <option key={idx} value={msg}>
                          Template {idx + 1}: "{msg.substring(0, 45)}..."
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Live Preview Card of Selected Birthday Announcement */}
              {settings.birthdayAnnouncement?.name && (
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
                    border: '2px solid rgba(249, 115, 22, 0.25)',
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.06)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#ea580c',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <i
                      className="fa-solid fa-eye"
                      style={{ marginRight: '6px' }}
                    />{' '}
                    Preview Tampilan Beranda:
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <img
                      src={
                        settings.birthdayAnnouncement?.photoUrl ||
                        '/assets/potensi_umkm.png'
                      }
                      alt={settings.birthdayAnnouncement?.name}
                      style={{
                        maxWidth: '100px',
                        maxHeight: '120px',
                        width: 'auto',
                        height: 'auto',
                        borderRadius: '12px',
                        objectFit: 'contain',
                        border: '2px solid #ffffff',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/potensi_umkm.png';
                      }}
                    />

                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 900,
                          color: '#0f172a',
                          margin: '0 0 0.2rem 0',
                        }}
                      >
                        {settings.birthdayAnnouncement?.name}
                      </h4>
                      <p
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#64748b',
                          margin: '0 0 0.5rem 0',
                        }}
                      >
                        {settings.birthdayAnnouncement?.role}
                      </p>
                      <p
                        style={{
                          fontSize: '0.88rem',
                          color: '#334155',
                          fontStyle: 'italic',
                          margin: 0,
                          background: '#fff',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          borderLeft: '3px solid #f97316',
                        }}
                      >
                        "
                        {settings.birthdayAnnouncement?.message ||
                          'Selamat Ulang Tahun!'}
                        "
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div
                style={{
                  marginTop: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={
                    settingsSubmitting ||
                    !settings.birthdayAnnouncement?.name ||
                    !settings.birthdayAnnouncement?.message
                  }
                  style={{
                    opacity:
                      !settings.birthdayAnnouncement?.name ||
                      !settings.birthdayAnnouncement?.message
                        ? 0.55
                        : 1,
                    cursor:
                      !settings.birthdayAnnouncement?.name ||
                      !settings.birthdayAnnouncement?.message
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  {settingsSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <i
                        className="fa-solid fa-floppy-disk"
                        style={{ marginRight: '6px' }}
                      />
                      Simpan Pengumuman Ulang Tahun
                    </>
                  )}
                </button>

                {(!settings.birthdayAnnouncement?.name ||
                  !settings.birthdayAnnouncement?.message) && (
                  <span
                    style={{
                      fontSize: '0.82rem',
                      color: '#ef4444',
                      fontWeight: 600,
                    }}
                  >
                    <i
                      className="fa-solid fa-circle-exclamation"
                      style={{ marginRight: '4px' }}
                    />
                    Pilih Anggota &amp; Template Ucapan di atas terlebih dahulu
                    untuk menyimpan.
                  </span>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ── TAB 2: VISI MISI ── */}
      {activeTab === 'visimisi' && (
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">
              <i className="fa-solid fa-bullseye" /> Pengaturan Pernyataan Visi
              & Misi
            </h2>
          </div>
          <div className="admin-card__body">
            {settingsError && (
              <div
                className="admin-alert admin-alert--error"
                style={{ marginBottom: '1.5rem' }}
              >
                <i className="fa-solid fa-circle-exclamation" />
                <span>{settingsError}</span>
              </div>
            )}

            {settingsSuccess && (
              <div
                className="admin-alert"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  marginBottom: '1.5rem',
                }}
              >
                <i className="fa-solid fa-circle-check" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSettingsSubmit}>
              <div className="admin-form-group">
                <label className="admin-form-label">Teks Visi Organisasi</label>
                <textarea
                  className="admin-form-control"
                  rows="3"
                  required
                  value={settings.visiText}
                  onChange={(e) =>
                    setSettings({ ...settings, visiText: e.target.value })
                  }
                />
              </div>

              <div className="admin-form-group">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <label
                    className="admin-form-label"
                    style={{ marginBottom: 0 }}
                  >
                    Poin-Poin Misi Organisasi
                  </label>
                  <button
                    type="button"
                    className="admin-btn admin-btn--outline admin-btn--sm"
                    onClick={addMisiItem}
                  >
                    <i className="fa-solid fa-plus" /> Tambah Poin Misi
                  </button>
                </div>

                {settings.misiList.map((misi, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <input
                      type="text"
                      className="admin-form-control"
                      required
                      value={misi}
                      onChange={(e) => handleMisiChange(idx, e.target.value)}
                    />
                    {settings.misiList.length > 1 && (
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--delete"
                        style={{
                          height: '40px',
                          width: '40px',
                          flexShrink: 0,
                        }}
                        onClick={() => removeMisiItem(idx)}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={settingsSubmitting}
                >
                  {settingsSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" /> Menyimpan...
                    </>
                  ) : (
                    'Simpan Visi & Misi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 3: CONTACT & FOOTER ── */}
      {activeTab === 'contact' && (
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">
              <i className="fa-solid fa-address-book" /> Pengaturan Kontak &
              Footer
            </h2>
          </div>
          <div className="admin-card__body">
            {settingsError && (
              <div
                className="admin-alert admin-alert--error"
                style={{ marginBottom: '1.5rem' }}
              >
                <i className="fa-solid fa-circle-exclamation" />
                <span>{settingsError}</span>
              </div>
            )}

            {settingsSuccess && (
              <div
                className="admin-alert"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  marginBottom: '1.5rem',
                }}
              >
                <i className="fa-solid fa-circle-check" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSettingsSubmit}>
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Alamat Lengkap Sekretariat
                </label>
                <textarea
                  className="admin-form-control"
                  rows="3"
                  required
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                />
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Nomor Telepon Kantor
                  </label>
                  <input
                    type="text"
                    className="admin-form-control"
                    required
                    value={settings.phone}
                    onChange={(e) =>
                      setSettings({ ...settings, phone: e.target.value })
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Nomor WhatsApp Call Center (Gunakan kode 62...)
                  </label>
                  <input
                    type="text"
                    className="admin-form-control"
                    required
                    placeholder="Contoh: 6281234567890"
                    value={settings.whatsapp}
                    onChange={(e) =>
                      setSettings({ ...settings, whatsapp: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-form-label">Alamat Email Resmi</label>
                  <input
                    type="email"
                    className="admin-form-control"
                    required
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    URL Embed Google Maps (Iframe Src)
                  </label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.mapsEmbedUrl}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        mapsEmbedUrl: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: '1.5rem',
                  borderTop: '1px solid #edf2f7',
                  paddingTop: '1.5rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    marginBottom: '1rem',
                    color: 'var(--text-main)',
                  }}
                >
                  Link Tautan Media Sosial
                </h3>
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      <i className="fa-brands fa-instagram" /> Instagram
                    </label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={settings.socialInstagram}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialInstagram: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      <i className="fa-brands fa-facebook" /> Facebook
                    </label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={settings.socialFacebook}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialFacebook: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="admin-form-group" style={{ maxWidth: '500px' }}>
                  <label className="admin-form-label">
                    <i className="fa-brands fa-youtube" /> YouTube
                  </label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.socialYoutube}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialYoutube: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={settingsSubmitting}
                >
                  {settingsSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" /> Menyimpan...
                    </>
                  ) : (
                    'Simpan Kontak & Footer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 4: SECURITY (PASSWORD) ── */}
      {activeTab === 'security' && (
        <div
          className="admin-grid-2"
          style={{ gridTemplateColumns: '1.5fr 1fr' }}
        >
          <div className="admin-card">
            <div className="admin-card__header">
              <h2 className="admin-card__title">
                <i className="fa-solid fa-key" /> Ubah Password Admin
              </h2>
            </div>
            <div className="admin-card__body">
              {passError && (
                <div
                  className="admin-alert admin-alert--error"
                  style={{ marginBottom: '1.5rem' }}
                >
                  <i className="fa-solid fa-circle-exclamation" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div
                  className="admin-alert"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    marginBottom: '1.5rem',
                  }}
                >
                  <i className="fa-solid fa-circle-check" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="old-password">
                    Password Lama
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="old-password"
                      type={showOld ? 'text' : 'password'}
                      className="admin-form-control"
                      required
                      placeholder="Masukkan password lama..."
                      value={passForm.oldPassword}
                      onChange={(e) =>
                        setPassForm({
                          ...passForm,
                          oldPassword: e.target.value,
                        })
                      }
                      style={{ paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      className="admin-password-toggle"
                      onClick={() => setShowOld(!showOld)}
                      style={{ color: '#64748b' }}
                      tabIndex={-1}
                    >
                      <i
                        className={`fa-solid ${showOld ? 'fa-eye-slash' : 'fa-eye'}`}
                      />
                    </button>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="new-password">
                    Password Baru
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="new-password"
                      type={showNew ? 'text' : 'password'}
                      className="admin-form-control"
                      required
                      placeholder="Masukkan password baru (min. 6 karakter)..."
                      value={passForm.newPassword}
                      onChange={(e) =>
                        setPassForm({
                          ...passForm,
                          newPassword: e.target.value,
                        })
                      }
                      style={{ paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      className="admin-password-toggle"
                      onClick={() => setShowNew(!showNew)}
                      style={{ color: '#64748b' }}
                      tabIndex={-1}
                    >
                      <i
                        className={`fa-solid ${showNew ? 'fa-eye-slash' : 'fa-eye'}`}
                      />
                    </button>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label
                    className="admin-form-label"
                    htmlFor="confirm-password"
                  >
                    Konfirmasi Password Baru
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      className="admin-form-control"
                      required
                      placeholder="Ulangi password baru Anda..."
                      value={passForm.confirmPassword}
                      onChange={(e) =>
                        setPassForm({
                          ...passForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      style={{ paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      className="admin-password-toggle"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{ color: '#64748b' }}
                      tabIndex={-1}
                    >
                      <i
                        className={`fa-solid ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}
                      />
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <button
                    type="submit"
                    className="admin-btn admin-btn--primary"
                    disabled={passSubmitting}
                  >
                    {passSubmitting ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin" />{' '}
                        Memperbarui...
                      </>
                    ) : (
                      'Perbarui Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card__header">
              <h2 className="admin-card__title">
                <i className="fa-solid fa-shield-halved" /> Panduan Keamanan
                Akun
              </h2>
            </div>
            <div
              className="admin-card__body"
              style={{
                color: '#475569',
                fontSize: '0.9rem',
                lineHeight: '1.6',
              }}
            >
              <p style={{ marginBottom: '1rem' }}>
                Demi menjaga keamanan portal admin Karang Taruna Kelurahan Rawa
                Arum, ikuti panduan berikut saat merubah password:
              </p>
              <ul
                style={{
                  paddingLeft: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <li>
                  <strong>Panjang Minimal</strong>: Password baru minimal 6
                  karakter.
                </li>
                <li>
                  <strong>Jaga Kredensial</strong>: Jangan bagikan akun login
                  admin ini kepada siapa pun kecuali pengurus resmi Karang
                  Taruna.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
