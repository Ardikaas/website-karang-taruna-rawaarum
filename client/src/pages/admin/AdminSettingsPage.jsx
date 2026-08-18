import { useState, useEffect } from 'react';
import {
  changePassword,
  fetchSiteSettings,
  updateSiteSettings,
  uploadImage,
  formatImageUrl,
  fetchPengurus,
  fetchAllAchievements,
  createAchievement,
  updateAchievement,
  toggleAchievementStatus,
  deleteAchievement,
  fetchAllHolidays,
  createHoliday,
  updateHoliday,
  toggleHolidayStatus,
  deleteHoliday,
} from '../../services/api';
import { getAvatarPhoto } from '../../constants/structureData';
import { compressImageIfNeeded } from '../../utils/imageCompressor';

const ACH_CATEGORY_OPTIONS = [
  {
    value: 'pendidikan',
    label: 'Pendidikan & Wisuda',
    icon: 'fa-solid fa-graduation-cap',
  },
  {
    value: 'akademik',
    label: 'Akademik & Sidang Skripsi',
    icon: 'fa-solid fa-book-open',
  },
  {
    value: 'pernikahan',
    label: 'Pernikahan & Momen Spesial',
    icon: 'fa-solid fa-ring',
  },
  {
    value: 'prestasi',
    label: 'Prestasi & Kejuaraan',
    icon: 'fa-solid fa-trophy',
  },
  {
    value: 'lainnya',
    label: 'Apresiasi Spesial',
    icon: 'fa-solid fa-star',
  },
];

const BIRTHDAY_TEMPLATE_MESSAGES = [
  'Selamat Ulang Tahun! Semoga bertambahnya usia membawa keberkahan, kesehatan yang prima, serta kemudahan dalam setiap niat baik. Terima kasih atas dedikasi dan kontribusi nyata dalam memajukan pemuda Kelurahan Rawa Arum.',
  'Barakallah fii umrik. Semoga Allah SWT senantiasa melimpahkan kesehatan, umur yang panjang dan penuh manfaat, serta melapangkan rezeki dan memberikan kemudahan dalam setiap karya dan pengabdian bagi masyarakat.',
  'Selamat Ulang Tahun! Semoga senantiasa diberikan kekuatan, kebahagiaan, dan inspirasi dalam melangkah. Terima kasih atas semangat kebersamaan dan kepemimpinan yang senantiasa membawa Karang Taruna Rawa Arum menjadi lebih solid.',
  'Selamat bertambah usia! Semoga panjang umur, sehat selalu, dan dipermudah segala langkah dalam meraih cita-cita. Semoga senantiasa menjadi pribadi yang menginspirasi dan membawa kemajuan bagi lingkungan Rawa Arum.',
  'Selamat Ulang Tahun! Selamat merayakan bertambahnya usia dengan penuh rasa syukur. Semoga senantiasa dilimpahi kebahagiaan bersama keluarga tercinta dan terus bersemangat dalam menebar manfaat bagi sesama.',
];

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'birthday' | 'apresiasi' | 'holidays' | 'visimisi' | 'contact' | 'security'
  const [pengurusList, setPengurusList] = useState([]);

  // ── Apresiasi Anggota State ──
  const [achievements, setAchievements] = useState([]);
  const [achLoading, setAchLoading] = useState(false);
  const [achModalOpen, setAchModalOpen] = useState(false);
  const [editingAch, setEditingAch] = useState(null);
  const [achSubmitting, setAchSubmitting] = useState(false);
  const [achUploading, setAchUploading] = useState(false);

  const [achForm, setAchForm] = useState({
    memberName: '',
    title: '',
    category: 'prestasi',
    message: '',
    imageUrl: '',
    date: '',
    whatsapp: '',
    isActive: true,
  });

  // ── Holiday Events (Hari Besar) State ──
  const HOLIDAY_THEME_OPTIONS = [
    { value: 'merah-putih', label: '🇮🇩 Merah Putih (Nasional)' },
    { value: 'religi-hijau', label: '🌙 Religi Hijau (Keagamaan Islam)' },
    { value: 'natal', label: '🎄 Natal (Keagamaan Kristen)' },
    { value: 'tahun-baru', label: '🎆 Tahun Baru' },
    { value: 'kartini', label: '🌸 Kartini / Feminin' },
    { value: 'custom', label: '🎨 Warna Custom' },
  ];

  const [holidayEvents, setHolidayEvents] = useState([]);
  const [holLoading, setHolLoading] = useState(false);
  const [holModalOpen, setHolModalOpen] = useState(false);
  const [editingHol, setEditingHol] = useState(null);
  const [holSubmitting, setHolSubmitting] = useState(false);
  const [holUploading, setHolUploading] = useState(false);
  const [particleUploading, setParticleUploading] = useState(false);
  const [holForm, setHolForm] = useState({
    title: '',
    subtitle: '',
    startDate: '',
    endDate: '',
    theme: 'merah-putih',
    customColor: '#0b2545',
    bannerImageUrl: '',
    particleImages: [],
    emoji: '🎉',
    isActive: true,
  });

  const loadHolidayEvents = async () => {
    try {
      setHolLoading(true);
      const data = await fetchAllHolidays();
      setHolidayEvents(data || []);
    } catch (_err) {
      // quiet fallback
    } finally {
      setHolLoading(false);
    }
  };

  const handleOpenAddHolModal = () => {
    setEditingHol(null);
    const today = new Date().toISOString().slice(0, 10);
    setHolForm({
      title: '',
      subtitle: '',
      startDate: today,
      endDate: today,
      theme: 'merah-putih',
      customColor: '#0b2545',
      bannerImageUrl: '',
      particleImages: [],
      emoji: '🎉',
      isActive: true,
    });
    setHolModalOpen(true);
  };

  const handleOpenEditHolModal = (item) => {
    setEditingHol(item);
    setHolForm({
      title: item.title || '',
      subtitle: item.subtitle || '',
      startDate: item.startDate ? item.startDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
      theme: item.theme || 'merah-putih',
      customColor: item.customColor || '#0b2545',
      bannerImageUrl: item.bannerImageUrl || '',
      particleImages: Array.isArray(item.particleImages)
        ? item.particleImages
        : [],
      emoji: item.emoji || '🎉',
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setHolModalOpen(true);
  };

  const handleSaveHoliday = async (e) => {
    e.preventDefault();
    if (!holForm.startDate || !holForm.endDate) return;
    try {
      setHolSubmitting(true);
      if (editingHol) {
        await updateHoliday(editingHol._id, holForm);
      } else {
        await createHoliday(holForm);
      }
      setHolModalOpen(false);
      await loadHolidayEvents();
    } catch (_err) {
      // quiet fallback
    } finally {
      setHolSubmitting(false);
    }
  };

  const handleToggleHoliday = async (id) => {
    try {
      await toggleHolidayStatus(id);
      await loadHolidayEvents();
    } catch (_err) {
      // quiet fallback
    }
  };

  const handleHolImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setHolUploading(true);
      const compressedFile = await compressImageIfNeeded(file);
      const res = await uploadImage(compressedFile);
      const url = res.url || res.fileUrl || res.imageUrl || res.path || '';
      setHolForm((prev) => ({ ...prev, bannerImageUrl: url }));
    } catch (err) {
      alert(err.message || 'Gagal mengunggah gambar banner.');
    } finally {
      setHolUploading(false);
    }
  };

  const handleParticleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setParticleUploading(true);
      const uploadPromises = files.map(async (file) => {
        const compressed = await compressImageIfNeeded(file);
        const res = await uploadImage(compressed);
        return res.url || res.fileUrl || res.imageUrl || res.path || '';
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(Boolean);

      setHolForm((prev) => ({
        ...prev,
        particleImages: [...(prev.particleImages || []), ...validUrls],
      }));
    } catch (err) {
      alert(err.message || 'Gagal mengunggah gambar elemen terbang.');
    } finally {
      setParticleUploading(false);
    }
  };

  const handleDeleteParticleImage = (indexToDelete) => {
    setHolForm((prev) => ({
      ...prev,
      particleImages: (prev.particleImages || []).filter(
        (_, idx) => idx !== indexToDelete
      ),
    }));
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data hari besar ini?')) return;
    try {
      await deleteHoliday(id);
      await loadHolidayEvents();
    } catch (_err) {
      // quiet fallback
    }
  };

  const loadAchievements = async () => {
    try {
      setAchLoading(true);
      const data = await fetchAllAchievements();
      setAchievements(data || []);
    } catch (_err) {
      // quiet fallback
    } finally {
      setAchLoading(false);
    }
  };

  const handleOpenAddAchModal = () => {
    setEditingAch(null);
    setAchForm({
      memberName: '',
      title: '',
      category: 'prestasi',
      message: '',
      imageUrl: '',
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      whatsapp: '',
      isActive: true,
    });
    setAchModalOpen(true);
  };

  const handleOpenEditAchModal = (item) => {
    setEditingAch(item);
    setAchForm({
      memberName: item.memberName || '',
      title: item.title || '',
      category: item.category || 'prestasi',
      message: item.message || '',
      imageUrl: item.imageUrl || '',
      date: item.date || '',
      whatsapp: item.whatsapp || '',
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setAchModalOpen(true);
  };

  const handleAchImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAchUploading(true);
      const compressedFile = await compressImageIfNeeded(file);
      const res = await uploadImage(compressedFile);
      const url = res.url || res.fileUrl || res.imageUrl || res.path || '';
      setAchForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      alert(err.message || 'Gagal mengunggah foto apresiasi.');
    } finally {
      setAchUploading(false);
    }
  };

  const handleAchSubmit = async (e) => {
    e.preventDefault();
    if (!achForm.memberName.trim() || !achForm.title.trim()) {
      alert('Nama anggota dan judul pencapaian wajib diisi.');
      return;
    }

    try {
      setAchSubmitting(true);
      if (editingAch) {
        await updateAchievement(editingAch._id, achForm);
      } else {
        await createAchievement(achForm);
      }
      setAchModalOpen(false);
      await loadAchievements();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan apresiasi.');
    } finally {
      setAchSubmitting(false);
    }
  };

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
          isMaintenanceMode: data.isMaintenanceMode || false,
          maintenanceMessage:
            data.maintenanceMessage ||
            'Website Karang Taruna Kelurahan Rawa Arum sedang dalam proses pemeliharaan dan peningkatan sistem (*Scheduled Maintenance*).',
          maintenanceEndTime: data.maintenanceEndTime || '',
        });
      } catch (_err) {
        setSettingsError('Gagal memuat pengaturan situs.');
      } finally {
        setSettingsLoading(false);
      }
    };

    loadSettings();
    loadAchievements();
    loadHolidayEvents();
  }, []);

  useEffect(() => {
    if (activeTab === 'holidays') {
      loadHolidayEvents();
    } else if (activeTab === 'apresiasi') {
      loadAchievements();
    }
  }, [activeTab]);

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
    if (activeTab === 'holidays') {
      loadHolidayEvents();
    }
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
          className={`admin-tab-btn ${activeTab === 'apresiasi' ? 'active' : ''}`}
          onClick={() => setActiveTab('apresiasi')}
        >
          <i className="fa-solid fa-trophy" style={{ color: '#f59e0b' }} />{' '}
          Apresiasi Anggota
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'holidays' ? 'active' : ''}`}
          onClick={() => setActiveTab('holidays')}
        >
          <i
            className="fa-solid fa-calendar-star"
            style={{ color: '#dc2626' }}
          />{' '}
          Hari Besar
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
        <button
          className={`admin-tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance')}
        >
          <i
            className="fa-solid fa-screwdriver-wrench"
            style={{ color: '#0ea5e9' }}
          />{' '}
          Mode Pemeliharaan (503)
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

      {/* ── TAB: APRESIASI ANGGOTA ── */}
      {activeTab === 'apresiasi' && (
        <div>
          <div className="admin-card">
            <div
              className="admin-card__header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <h2 className="admin-card__title">
                  <i
                    className="fa-solid fa-trophy"
                    style={{ color: '#f59e0b' }}
                  />{' '}
                  Apresiasi & Banner Pencapaian Anggota
                </h2>
                <p
                  style={{
                    fontSize: '0.83rem',
                    color: '#64748b',
                    margin: '4px 0 0',
                  }}
                >
                  Kelola kartu ucapan apresiasi atas pencapaian anggota (Wisuda,
                  Sidang Skripsi, Pernikahan, Rangking, dsb.).
                </p>
              </div>
              <button
                className="admin-btn admin-btn--primary"
                onClick={handleOpenAddAchModal}
              >
                <i className="fa-solid fa-plus" /> Tambah Apresiasi
              </button>
            </div>

            <div className="admin-card__body">
              {achLoading ? (
                <div className="admin-loading-container">
                  <i className="fa-solid fa-spinner fa-spin admin-spinner" />
                  <p>Memuat data apresiasi anggota...</p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {/* Dashed "+ Tambah Apresiasi Baru" Card */}
                  <div
                    onClick={handleOpenAddAchModal}
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: 'var(--radius-md)',
                      minHeight: '230px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#f8fafc',
                      transition: 'all 0.2s ease',
                      padding: '1.5rem',
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.backgroundColor =
                        'rgba(59, 130, 246, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <i className="fa-solid fa-plus" />
                    </div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: '#1e293b',
                      }}
                    >
                      + Tambah Apresiasi Baru
                    </h4>
                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: '0.78rem',
                        color: '#64748b',
                      }}
                    >
                      Klik di sini untuk menambah kartu pencapaian anggota baru.
                    </p>
                  </div>

                  {/* Existing Achievement Cards */}
                  {(Array.isArray(achievements) ? achievements : []).map(
                    (item) => {
                      const catObj = ACH_CATEGORY_OPTIONS.find(
                        (c) => c.value === item.category
                      );

                      return (
                        <div
                          key={item._id}
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <div
                            style={{
                              position: 'relative',
                              height: '140px',
                              backgroundColor: '#0f172a',
                            }}
                          >
                            <img
                              src={item.imageUrl || '/assets/potensi_umkm.png'}
                              alt={item.memberName}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                  '/assets/potensi_umkm.png';
                              }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                top: '0.5rem',
                                right: '0.5rem',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '50px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                backgroundColor: item.isActive
                                  ? 'rgba(16, 185, 129, 0.95)'
                                  : 'rgba(239, 68, 68, 0.95)',
                                color: '#ffffff',
                              }}
                            >
                              {item.isActive ? '● Aktif' : '○ Nonaktif'}
                            </span>
                          </div>

                          <div
                            style={{
                              padding: '1rem',
                              display: 'flex',
                              flexDirection: 'column',
                              flexGrow: 1,
                            }}
                          >
                            <h4
                              style={{
                                fontSize: '0.95rem',
                                fontWeight: 900,
                                color: 'var(--primary-deep)',
                                margin: '0 0 0.25rem',
                                lineHeight: 1.3,
                              }}
                            >
                              {item.title}
                            </h4>

                            <div
                              style={{
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                color: '#0ea5e9',
                                marginBottom: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <i className="fa-solid fa-user-check" />{' '}
                              {item.memberName}
                            </div>

                            <p
                              style={{
                                fontSize: '0.78rem',
                                color: '#64748b',
                                fontStyle: 'italic',
                                margin: '0 0 1rem',
                                flexGrow: 1,
                              }}
                            >
                              "{item.message}"
                            </p>

                            <div
                              style={{
                                display: 'flex',
                                gap: '0.4rem',
                                borderTop: '1px solid #f1f5f9',
                                paddingTop: '0.75rem',
                              }}
                            >
                              <button
                                className={`admin-btn admin-btn--sm ${item.isActive ? 'admin-btn--outline' : 'admin-btn--primary'}`}
                                style={{
                                  flex: 1,
                                  fontSize: '0.75rem',
                                  padding: '0.3rem 0.5rem',
                                }}
                                onClick={async () => {
                                  try {
                                    await toggleAchievementStatus(item._id);
                                    await loadAchievements();
                                  } catch (err) {
                                    alert(err.message);
                                  }
                                }}
                              >
                                {item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>

                              <button
                                className="admin-btn admin-btn--outline admin-btn--sm"
                                title="Edit"
                                onClick={() => handleOpenEditAchModal(item)}
                              >
                                <i className="fa-solid fa-pen-to-square" />
                              </button>

                              <button
                                className="admin-btn admin-btn--danger admin-btn--sm"
                                title="Hapus"
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      `Hapus apresiasi untuk ${item.memberName}?`
                                    )
                                  ) {
                                    try {
                                      await deleteAchievement(item._id);
                                      await loadAchievements();
                                    } catch (err) {
                                      alert(err.message);
                                    }
                                  }
                                }}
                              >
                                <i className="fa-solid fa-trash" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Modal Form Add / Edit */}
          {achModalOpen && (
            <div className="admin-modal-backdrop">
              <div className="admin-modal" style={{ maxWidth: '580px' }}>
                <div className="admin-modal__header">
                  <h3 className="admin-modal__title">
                    <i
                      className="fa-solid fa-trophy"
                      style={{ marginRight: '8px', color: '#f59e0b' }}
                    />
                    {editingAch
                      ? 'Edit Apresiasi Anggota'
                      : 'Tambah Apresiasi Baru'}
                  </h3>
                  <button
                    className="admin-modal__close"
                    onClick={() => setAchModalOpen(false)}
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleAchSubmit}>
                  <div
                    className="admin-modal__body"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                    }}
                  >
                    <div className="admin-form-group">
                      <label className="admin-form-label">Nama Anggota *</label>
                      <input
                        type="text"
                        required
                        className="admin-form-control"
                        placeholder="Contoh: Ahmad Rizky, S.T."
                        value={achForm.memberName}
                        onChange={(e) =>
                          setAchForm({ ...achForm, memberName: e.target.value })
                        }
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Judul Pencapaian *
                      </label>
                      <input
                        type="text"
                        required
                        className="admin-form-control"
                        placeholder="Contoh: Lulus Sidang Skripsi & Gelar Sarjana Teknik"
                        value={achForm.title}
                        onChange={(e) =>
                          setAchForm({ ...achForm, title: e.target.value })
                        }
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Tanggal Momen</label>
                      <input
                        type="text"
                        className="admin-form-control"
                        placeholder="Contoh: 15 Agustus 2026"
                        value={achForm.date}
                        onChange={(e) =>
                          setAchForm({ ...achForm, date: e.target.value })
                        }
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Ucapan & Doa Apresiasi
                      </label>
                      <textarea
                        rows="3"
                        className="admin-form-control"
                        placeholder="Masukkan ucapan apresiasi & doa kebanggaan dari Karang Taruna..."
                        value={achForm.message}
                        onChange={(e) =>
                          setAchForm({ ...achForm, message: e.target.value })
                        }
                        style={{ width: '100%', resize: 'vertical' }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Foto Anggota / Momen
                      </label>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          alignItems: 'center',
                        }}
                      >
                        <input
                          type="text"
                          className="admin-form-control"
                          placeholder="URL Foto atau unggah gambar..."
                          value={achForm.imageUrl}
                          onChange={(e) =>
                            setAchForm({ ...achForm, imageUrl: e.target.value })
                          }
                          style={{ flex: 1 }}
                        />
                        <label
                          className="admin-btn admin-btn--outline"
                          style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          <i className="fa-solid fa-upload" />{' '}
                          {achUploading ? 'Mengunggah...' : 'Unggah Foto'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAchImageUpload}
                            style={{ display: 'none' }}
                            disabled={achUploading}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Nomor WhatsApp Anggota (Opsional)
                      </label>
                      <input
                        type="text"
                        className="admin-form-control"
                        placeholder="Contoh: 081234567890 (untuk ucapan via WA)"
                        value={achForm.whatsapp}
                        onChange={(e) =>
                          setAchForm({ ...achForm, whatsapp: e.target.value })
                        }
                      />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        paddingTop: '0.25rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        id="achIsActiveCheck"
                        checked={achForm.isActive}
                        onChange={(e) =>
                          setAchForm({ ...achForm, isActive: e.target.checked })
                        }
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label
                        htmlFor="achIsActiveCheck"
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer',
                        }}
                      >
                        Tampilkan Banner di Beranda (Status Aktif)
                      </label>
                    </div>
                  </div>

                  <div className="admin-modal__footer">
                    <button
                      type="button"
                      className="admin-btn admin-btn--outline"
                      onClick={() => setAchModalOpen(false)}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="admin-btn admin-btn--primary"
                      disabled={achSubmitting || achUploading}
                    >
                      {achSubmitting ? 'Menyimpan...' : 'Simpan Apresiasi'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════ TAB: Hari Besar ══════════ */}
      {activeTab === 'holidays' && (
        <div className="admin-settings-card">
          <div
            className="admin-card-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <h3>
                <i className="fa-solid fa-calendar-star" /> Kelola Hari Besar
              </h3>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem',
                }}
              >
                Tampilkan strip banner dekoratif di halaman utama saat hari
                besar nasional atau keagamaan.
              </p>
            </div>
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleOpenAddHolModal}
            >
              <i className="fa-solid fa-plus" /> Tambah Hari Besar
            </button>
          </div>

          {holLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <i
                className="fa-solid fa-circle-notch fa-spin"
                style={{ fontSize: '1.5rem', color: 'var(--accent)' }}
              ></i>
            </div>
          ) : holidayEvents.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2.5rem 1rem',
                color: 'var(--text-muted)',
              }}
            >
              <i
                className="fa-solid fa-calendar-xmark"
                style={{
                  fontSize: '2.5rem',
                  marginBottom: '0.75rem',
                  display: 'block',
                  opacity: 0.4,
                }}
              ></i>
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                Belum ada data hari besar
              </p>
              <p style={{ fontSize: '0.78rem' }}>
                Klik tombol "Tambah Hari Besar" untuk menambahkan event.
              </p>
            </div>
          ) : (
            <div className="admin-table-wrapper" style={{ marginTop: '1rem' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Tema</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {holidayEvents.map((ev) => {
                    const now = new Date();
                    const start = new Date(ev.startDate);
                    const end = new Date(ev.endDate);
                    const isLive = ev.isActive && now >= start && now <= end;
                    const formatDate = (d) =>
                      new Date(d).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });

                    return (
                      <tr key={ev._id}>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <span style={{ fontSize: '1.3rem' }}>
                              {ev.emoji || '🎉'}
                            </span>
                            <div>
                              <strong style={{ fontSize: '0.85rem' }}>
                                {ev.title}
                              </strong>
                              {ev.subtitle && (
                                <div
                                  style={{
                                    fontSize: '0.72rem',
                                    color: 'var(--text-muted)',
                                  }}
                                >
                                  {ev.subtitle}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className="admin-badge"
                            style={{
                              background: 'var(--bg-main)',
                              color: 'var(--text-secondary)',
                              fontSize: '0.72rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '8px',
                            }}
                          >
                            {ev.theme}
                          </span>
                        </td>
                        <td
                          style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                        >
                          {formatDate(ev.startDate)} — {formatDate(ev.endDate)}
                        </td>
                        <td>
                          {isLive ? (
                            <span
                              className="admin-badge admin-badge--success"
                              style={{ fontSize: '0.72rem' }}
                            >
                              <i
                                className="fa-solid fa-circle"
                                style={{ fontSize: '0.5rem' }}
                              />{' '}
                              LIVE
                            </span>
                          ) : ev.isActive ? (
                            <span
                              className="admin-badge admin-badge--warning"
                              style={{ fontSize: '0.72rem' }}
                            >
                              Dijadwalkan
                            </span>
                          ) : (
                            <span
                              className="admin-badge admin-badge--muted"
                              style={{ fontSize: '0.72rem' }}
                            >
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.35rem',
                              flexWrap: 'wrap',
                            }}
                          >
                            <button
                              className="admin-btn admin-btn--sm admin-btn--outline"
                              onClick={() => handleOpenEditHolModal(ev)}
                              title="Edit"
                            >
                              <i className="fa-solid fa-pen" />
                            </button>
                            <button
                              className={`admin-btn admin-btn--sm ${ev.isActive ? 'admin-btn--warning' : 'admin-btn--success'}`}
                              onClick={() => handleToggleHoliday(ev._id)}
                              title={ev.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            >
                              <i
                                className={`fa-solid ${ev.isActive ? 'fa-eye-slash' : 'fa-eye'}`}
                              />
                            </button>
                            <button
                              className="admin-btn admin-btn--sm admin-btn--danger"
                              onClick={() => handleDeleteHoliday(ev._id)}
                              title="Hapus"
                            >
                              <i className="fa-solid fa-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal Form Tambah/Edit Hari Besar */}
          {holModalOpen && (
            <div className="admin-modal-overlay">
              <div className="admin-modal" style={{ maxWidth: '540px' }}>
                <div className="admin-modal__header">
                  <h4 className="admin-modal__title">
                    <i
                      className="fa-solid fa-calendar-star"
                      style={{ color: 'var(--accent)', marginRight: '0.5rem' }}
                    />
                    {editingHol ? 'Edit Hari Besar' : 'Tambah Hari Besar'}
                  </h4>
                  <button
                    type="button"
                    className="admin-modal__close"
                    onClick={() => setHolModalOpen(false)}
                    title="Tutup"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
                <form onSubmit={handleSaveHoliday}>
                  <div className="admin-modal__body">
                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Judul Event (Opsional)
                      </label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Contoh: Hari Kemerdekaan RI ke-81 (kosongkan jika sudah ada di gambar banner)"
                        value={holForm.title}
                        onChange={(e) =>
                          setHolForm({ ...holForm, title: e.target.value })
                        }
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Subtitle / Ucapan (Opsional)
                      </label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Contoh: Dirgahayu Republik Indonesia 🇮🇩"
                        value={holForm.subtitle}
                        onChange={(e) =>
                          setHolForm({ ...holForm, subtitle: e.target.value })
                        }
                      />
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.85rem',
                      }}
                    >
                      <div className="admin-form-group">
                        <label className="admin-form-label">
                          Tanggal Mulai *
                        </label>
                        <input
                          type="date"
                          className="admin-input"
                          value={holForm.startDate}
                          onChange={(e) =>
                            setHolForm({
                              ...holForm,
                              startDate: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">
                          Tanggal Selesai *
                        </label>
                        <input
                          type="date"
                          className="admin-input"
                          value={holForm.endDate}
                          onChange={(e) =>
                            setHolForm({ ...holForm, endDate: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Tema Visual Gradien
                      </label>
                      {holForm.bannerImageUrl ? (
                        <div
                          style={{
                            padding: '0.65rem 0.85rem',
                            background: '#f1f5f9',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.82rem',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <i
                            className="fa-solid fa-circle-info"
                            style={{ color: 'var(--accent)' }}
                          />
                          <em>
                            Tema visual gradien dinonaktifkan karena Anda
                            menggunakan Gambar Banner kustom.
                          </em>
                        </div>
                      ) : (
                        <select
                          className="admin-input"
                          value={holForm.theme}
                          onChange={(e) =>
                            setHolForm({ ...holForm, theme: e.target.value })
                          }
                        >
                          {HOLIDAY_THEME_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    {!holForm.bannerImageUrl && holForm.theme === 'custom' && (
                      <div className="admin-form-group">
                        <label className="admin-form-label">Warna Custom</label>
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                          }}
                        >
                          <input
                            type="color"
                            value={holForm.customColor}
                            onChange={(e) =>
                              setHolForm({
                                ...holForm,
                                customColor: e.target.value,
                              })
                            }
                            style={{
                              width: '48px',
                              height: '40px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          />
                          <input
                            type="text"
                            className="admin-input"
                            value={holForm.customColor}
                            onChange={(e) =>
                              setHolForm({
                                ...holForm,
                                customColor: e.target.value,
                              })
                            }
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        <i
                          className="fa-solid fa-wand-magic-sparkles"
                          style={{ color: 'var(--accent)' }}
                        />{' '}
                        Elemen Terbang PNG / Particles (Opsional)
                      </label>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.6rem',
                        }}
                      >
                        {holForm.particleImages &&
                        holForm.particleImages.length > 0 ? (
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.6rem',
                            }}
                          >
                            {holForm.particleImages.map((imgUrl, idx) => (
                              <div
                                key={idx}
                                style={{
                                  position: 'relative',
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '8px',
                                  border: '1px solid #cbd5e1',
                                  background: '#f8fafc',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <img
                                  src={formatImageUrl(imgUrl)}
                                  alt={`Particle ${idx + 1}`}
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteParticleImage(idx)}
                                  style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    background: 'rgba(239, 68, 68, 0.9)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                    fontSize: '0.65rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  title="Hapus elemen"
                                >
                                  <i className="fa-solid fa-xmark" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--text-muted)',
                            }}
                          >
                            Belum ada gambar elemen terbang PNG. (Bisa upload
                            lebih dari 1 gambar PNG transparan).
                          </span>
                        )}

                        <label
                          className="admin-btn admin-btn--outline admin-btn--sm"
                          style={{
                            cursor: 'pointer',
                            alignSelf: 'flex-start',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            margin: 0,
                          }}
                        >
                          <i
                            className={`fa-solid ${particleUploading ? 'fa-spinner fa-spin' : 'fa-plus'}`}
                          />
                          {particleUploading
                            ? 'Mengunggah PNG...'
                            : '+ Upload Gambar Elemen Terbang (PNG Transparan)'}
                          <input
                            type="file"
                            accept="image/png,image/webp,image/gif"
                            multiple
                            onChange={handleParticleImageUpload}
                            style={{ display: 'none' }}
                            disabled={particleUploading}
                          />
                        </label>
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#64748b',
                          marginTop: '0.25rem',
                          display: 'block',
                        }}
                      >
                        💡 Upload file <strong>PNG transparan</strong> (bisa
                        upload banyak sekaligus) yang akan terbang/melayang
                        beraneka ragam di atas banner.
                      </span>
                    </div>
                    <div
                      className="admin-form-group"
                      style={{ marginBottom: 0 }}
                    >
                      <label className="admin-form-label">
                        <i
                          className="fa-solid fa-image"
                          style={{ color: 'var(--accent)' }}
                        />{' '}
                        Gambar Banner (Opsional)
                      </label>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }}
                      >
                        {holForm.bannerImageUrl ? (
                          <div
                            style={{
                              position: 'relative',
                              width: '100px',
                              height: '56px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '1px solid #cbd5e1',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            }}
                          >
                            <img
                              src={formatImageUrl(holForm.bannerImageUrl)}
                              alt="Banner Preview"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setHolForm((prev) => ({
                                  ...prev,
                                  bannerImageUrl: '',
                                }))
                              }
                              style={{
                                position: 'absolute',
                                top: '3px',
                                right: '3px',
                                background: 'rgba(239, 68, 68, 0.9)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '22px',
                                height: '22px',
                                cursor: 'pointer',
                                fontSize: '0.7rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              title="Hapus gambar"
                            >
                              <i className="fa-solid fa-xmark" />
                            </button>
                          </div>
                        ) : null}

                        <label
                          className="admin-btn admin-btn--outline"
                          style={{
                            cursor: 'pointer',
                            margin: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          <i
                            className={`fa-solid ${holUploading ? 'fa-spinner fa-spin' : 'fa-upload'}`}
                          />
                          {holUploading
                            ? 'Mengunggah...'
                            : holForm.bannerImageUrl
                              ? 'Ganti Gambar Banner'
                              : 'Upload File Gambar Banner'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHolImageUpload}
                            style={{ display: 'none' }}
                            disabled={holUploading}
                          />
                        </label>
                      </div>
                      <div
                        style={{
                          marginTop: '0.65rem',
                          padding: '0.75rem 0.85rem',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          color: '#475569',
                        }}
                      >
                        <strong
                          style={{
                            color: '#1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            marginBottom: '0.35rem',
                          }}
                        >
                          <i
                            className="fa-solid fa-circle-info"
                            style={{ color: 'var(--accent)' }}
                          />{' '}
                          Rekomendasi Ukuran Gambar Banner (Rasio 8:1 - 10:1):
                        </strong>
                        <ul
                          style={{
                            paddingLeft: '1.1rem',
                            margin: 0,
                            lineHeight: 1.5,
                          }}
                        >
                          <li>
                            <strong>Desktop / Smart TV (Besar):</strong> 1920 ×
                            240 px
                          </li>
                          <li>
                            <strong>Laptop / PC (Normal):</strong> 1280 × 160 px
                          </li>
                          <li>
                            <strong>Tablet / HP (Kecil):</strong> 768 × 120 px
                            atau 480 × 100 px
                          </li>
                        </ul>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: '#64748b',
                            marginTop: '0.35rem',
                            display: 'block',
                          }}
                        >
                          💡{' '}
                          <em>
                            Format: JPG, PNG, WEBP. Gambar akan menyesuaikan
                            (crop center cover) secara otomatis di layar kecil.
                            Posisikan subjek utama di bagian tengah.
                          </em>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="admin-modal__footer">
                    <button
                      type="button"
                      className="admin-btn admin-btn--outline"
                      onClick={() => setHolModalOpen(false)}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="admin-btn admin-btn--primary"
                      disabled={holSubmitting}
                    >
                      {holSubmitting ? 'Menyimpan...' : 'Simpan Hari Besar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: MAINTENANCE MODE MANAGEMENT (503) ── */}
      {activeTab === 'maintenance' && (
        <form onSubmit={handleSettingsSubmit}>
          <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
            <div className="admin-card__header">
              <h2 className="admin-card__title">
                <i
                  className="fa-solid fa-screwdriver-wrench"
                  style={{ color: '#0ea5e9', marginRight: '0.5rem' }}
                />
                Konfigurasi Mode Pemeliharaan Sistem (Maintenance 503)
              </h2>
              <p className="admin-card__desc">
                Saat mode pemeliharaan diaktifkan, seluruh pengunjung publik
                akan diarahkan ke halaman informasi{' '}
                <strong>HTTP 503 Maintenance</strong>. Pengurus dan
                Administrator tetap dapat masuk dan mengelola sistem melalui
                portal ini.
              </p>
            </div>
            <div className="admin-card__body">
              {/* Toggle Switch */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: settings.isMaintenanceMode
                    ? '#eff6ff'
                    : '#f8fafc',
                  border: `1.5px solid ${settings.isMaintenanceMode ? '#38bdf8' : '#e2e8f0'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <h4
                    style={{
                      margin: '0 0 0.25rem',
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: settings.isMaintenanceMode
                        ? '#0369a1'
                        : 'var(--primary-deep)',
                    }}
                  >
                    Status Mode Pemeliharaan:{' '}
                    <span
                      style={{
                        color: settings.isMaintenanceMode
                          ? '#0284c7'
                          : '#64748b',
                      }}
                    >
                      {settings.isMaintenanceMode
                        ? 'AKTIF (ON)'
                        : 'TIDAK AKTIF (OFF)'}
                    </span>
                  </h4>
                  <p
                    style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}
                  >
                    {settings.isMaintenanceMode
                      ? '⚠️ Perhatian: Publik sedang tidak dapat mengakses halaman utama website.'
                      : '✅ Website saat ini beroperasi normal dan dapat diakses oleh seluruh pengunjung publik.'}
                  </p>
                </div>

                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '56px',
                    height: '30px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.isMaintenanceMode}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        isMaintenanceMode: e.target.checked,
                      }))
                    }
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings.isMaintenanceMode
                        ? '#0284c7'
                        : '#cbd5e1',
                      transition: '.3s',
                      borderRadius: '30px',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: "''",
                        height: '22px',
                        width: '22px',
                        left: settings.isMaintenanceMode ? '28px' : '4px',
                        bottom: '4px',
                        backgroundColor: 'white',
                        transition: '.3s',
                        borderRadius: '50%',
                      }}
                    />
                  </span>
                </label>
              </div>

              {/* Maintenance Message */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Pesan Pemberitahuan untuk Pengunjung Publik:
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={settings.maintenanceMessage}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      maintenanceMessage: e.target.value,
                    }))
                  }
                  placeholder="Contoh: Website Karang Taruna sedang dalam proses peningkatan layanan (*Scheduled Maintenance*)..."
                />
                <span
                  className="form-hint"
                  style={{ fontSize: '0.75rem', color: '#64748b' }}
                >
                  Pesan ini akan ditampilkan secara prominen pada kartu halaman
                  error 503 publik.
                </span>
              </div>

              {/* Estimated Completion Time */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Estimasi Waktu Selesai (Opsional):
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.maintenanceEndTime}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      maintenanceEndTime: e.target.value,
                    }))
                  }
                  placeholder="Contoh: Hari Ini pukul 18:00 WIB"
                />
              </div>
            </div>

            <div
              className="admin-card__footer"
              style={{
                padding: '1rem 1.5rem',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="submit"
                className="admin-btn admin-btn--primary"
                disabled={settingsSaving}
              >
                {settingsSaving ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-floppy-disk" /> Simpan Pengaturan
                    Pemeliharaan
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminSettingsPage;
