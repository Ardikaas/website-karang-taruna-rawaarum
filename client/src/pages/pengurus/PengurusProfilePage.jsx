import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getRoleConfig } from '../../constants/roles';
import { updateUserProfile, uploadImage } from '../../services/api';
import { compressImage } from '../../utils/imageCompressor';

const PLATFORM_OPTIONS = [
  { value: 'Instagram', icon: 'fa-brands fa-instagram', color: '#e1306c' },
  { value: 'Facebook', icon: 'fa-brands fa-facebook', color: '#1877f2' },
  { value: 'TikTok', icon: 'fa-brands fa-tiktok', color: '#000000' },
  { value: 'LinkedIn', icon: 'fa-brands fa-linkedin', color: '#0a66c2' },
  { value: 'YouTube', icon: 'fa-brands fa-youtube', color: '#ff0000' },
  { value: 'X (Twitter)', icon: 'fa-brands fa-x-twitter', color: '#0f1419' },
];

const PengurusProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const roleConfig = getRoleConfig(user?.role);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    imageUrl: '',
  });

  // Dynamic Socials Array (Min 0, Max 3) -> [{ platform, username, url }]
  const [socials, setSocials] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load current profile data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        imageUrl: user.imageUrl || '',
      });
      setSocials(
        user.socials && Array.isArray(user.socials) ? user.socials : []
      );
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Upload Profile Avatar with Auto Compression (< 500KB)
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      // Auto compress image down to max 500KB & 800x800 resolution
      const compressedFile = await compressImage(file, 500, 800);
      const res = await uploadImage(compressedFile);
      const url =
        typeof res === 'string' ? res : res?.imageUrl || res?.url || '';
      setFormData((prev) => ({ ...prev, imageUrl: url }));
      showSuccess(
        'Foto profil berhasil dikompres & diunggah! Klik simpan profil.',
        'Foto Berhasil Diunggah'
      );
    } catch (err) {
      showError(err.message || 'Gagal mengunggah foto profil.', 'Upload Gagal');
    } finally {
      setUploadingImage(false);
    }
  };

  // Add social media item (Max 3)
  const handleAddSocial = () => {
    if (socials.length >= 3) {
      showError(
        'Maksimal hanya 3 akun media sosial yang dapat ditambahkan.',
        'Batas Maksimum'
      );
      return;
    }
    setSocials([...socials, { platform: 'Instagram', username: '', url: '' }]);
  };

  // Remove social media item (Min 0)
  const handleRemoveSocial = (index) => {
    setSocials(socials.filter((_, idx) => idx !== index));
  };

  // Update social media field item
  const handleSocialChange = (index, field, value) => {
    const updated = [...socials];
    updated[index][field] = value;

    // Auto-generate URL if user types username and URL is empty or auto-generated
    if (field === 'username' && value.trim()) {
      const platform = updated[index].platform;
      const cleanUser = value.replace('@', '').trim();
      if (platform === 'Instagram')
        updated[index].url = `https://instagram.com/${cleanUser}`;
      else if (platform === 'Facebook')
        updated[index].url = `https://facebook.com/${cleanUser}`;
      else if (platform === 'TikTok')
        updated[index].url = `https://tiktok.com/@${cleanUser}`;
      else if (platform === 'LinkedIn')
        updated[index].url = `https://linkedin.com/in/${cleanUser}`;
      else if (platform === 'YouTube')
        updated[index].url = `https://youtube.com/@${cleanUser}`;
      else if (platform === 'X (Twitter)')
        updated[index].url = `https://x.com/${cleanUser}`;
    }

    setSocials(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showError('Nama lengkap tidak boleh kosong.', 'Validasi Gagal');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        socials,
      };
      const res = await updateUserProfile(payload);
      if (res.user && updateUser) {
        updateUser(res.user);
      }
      showSuccess(
        res.message || 'Profil berhasil diperbarui!',
        'Berhasil Disimpan'
      );
    } catch (err) {
      showError(
        err.message || 'Gagal menyimpan perubahan profil.',
        'Terjadi Kesalahan'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page-container">
      {/* ── Page Header ── */}
      <div className="admin-page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1
            className="admin-page-title"
            style={{ fontSize: '1.6rem', fontWeight: 900 }}
          >
            <i
              className="fa-solid fa-user-gear"
              style={{ color: 'var(--accent)', marginRight: '0.6rem' }}
            />
            Profil & Akun Pengurus
          </h1>
          <p
            className="admin-page-subtitle"
            style={{
              fontSize: '0.95rem',
              color: '#475569',
              marginTop: '0.3rem',
            }}
          >
            Halaman pengaturan informasi diri, foto profil, kontak WhatsApp, dan
            tautan sosial media Anda.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            className="admin-badge admin-badge--warning"
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
          >
            <i className="fa-solid fa-user-shield" /> Peran: {roleConfig.label}
          </span>
        </div>
      </div>

      {/* ── Form Profile Card ── */}
      <div
        className="admin-card admin-fade-in"
        style={{
          marginBottom: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        <div
          className="admin-card__header"
          style={{
            padding: '1.5rem 1.75rem',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div>
            <h2
              className="admin-card__title"
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--primary-deep)',
              }}
            >
              <i
                className="fa-solid fa-pen-to-square"
                style={{ color: 'var(--accent)', marginRight: '0.5rem' }}
              />
              Formulir Data Pengurus
            </h2>
            <p
              style={{
                margin: '0.2rem 0 0',
                fontSize: '0.85rem',
                color: '#64748b',
              }}
            >
              Silakan perbarui data di bawah ini. Pastikan foto profil, kontak
              WhatsApp, dan sosial media aktif.
            </p>
          </div>
        </div>

        <div className="admin-card__body" style={{ padding: '1.75rem' }}>
          <form onSubmit={handleSubmit}>
            {/* Section 0: Display & Upload Foto Profil */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                marginBottom: '2rem',
                padding: '1.25rem',
                background: '#f8fafc',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                }}
              >
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Foto Profil"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <span>{formData.name?.[0]?.toUpperCase() || 'P'}</span>
                )}
              </div>

              <div>
                <h4
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--primary-deep)',
                    margin: '0 0 0.25rem',
                  }}
                >
                  Foto Profil Pengurus
                </h4>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#64748b',
                    margin: '0 0 0.75rem',
                    lineHeight: 1.4,
                  }}
                >
                  Rekomendasi ukuran: <strong>500 x 500 piksel</strong> (Rasio
                  1:1 / Persegi).
                </p>
                <div
                  style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    id="profile-avatar-upload"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="profile-avatar-upload"
                    className="admin-btn admin-btn--primary admin-btn--sm"
                    style={{
                      cursor: uploadingImage ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {uploadingImage ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin" />{' '}
                        Mengunggah...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-camera" /> Unggah Foto Baru
                      </>
                    )}
                  </label>
                  {formData.imageUrl && (
                    <button
                      type="button"
                      className="admin-btn admin-btn--outline admin-btn--sm"
                      style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    >
                      <i className="fa-solid fa-trash-can" /> Hapus Foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Section 1: Informasi Utama */}
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--primary-deep)',
                  marginBottom: '1.25rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid #e2e8f0',
                }}
              >
                1. Informasi Dasar Akun
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                <div className="admin-form-group">
                  <label
                    className="admin-form-label"
                    style={{ fontSize: '0.9rem', fontWeight: 700 }}
                  >
                    <i
                      className="fa-solid fa-user"
                      style={{ color: 'var(--accent)' }}
                    />{' '}
                    Nama Lengkap <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="admin-form-control"
                    style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap Anda..."
                    required
                  />
                  <small
                    style={{
                      color: '#64748b',
                      fontSize: '0.78rem',
                      marginTop: '0.35rem',
                      display: 'block',
                    }}
                  >
                    Nama lengkap yang akan ditampilkan di website dan laporan.
                  </small>
                </div>

                <div className="admin-form-group">
                  <label
                    className="admin-form-label"
                    style={{ fontSize: '0.9rem', fontWeight: 700 }}
                  >
                    <i
                      className="fa-solid fa-at"
                      style={{ color: 'var(--accent)' }}
                    />{' '}
                    Username Login <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="admin-form-control"
                    style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username untuk login..."
                    required
                  />
                  <small
                    style={{
                      color: '#64748b',
                      fontSize: '0.78rem',
                      marginTop: '0.35rem',
                      display: 'block',
                    }}
                  >
                    Digunakan untuk masuk (login) ke dalam sistem portal.
                  </small>
                </div>

                <div className="admin-form-group">
                  <label
                    className="admin-form-label"
                    style={{ fontSize: '0.9rem', fontWeight: 700 }}
                  >
                    <i
                      className="fa-solid fa-envelope"
                      style={{ color: 'var(--accent)' }}
                    />{' '}
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="admin-form-control"
                    style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contoh: nama@email.com"
                  />
                  <small
                    style={{
                      color: '#64748b',
                      fontSize: '0.78rem',
                      marginTop: '0.35rem',
                      display: 'block',
                    }}
                  >
                    Alamat surel email aktif untuk pemberitahuan akun.
                  </small>
                </div>

                <div className="admin-form-group">
                  <label
                    className="admin-form-label"
                    style={{ fontSize: '0.9rem', fontWeight: 700 }}
                  >
                    <i
                      className="fa-brands fa-whatsapp"
                      style={{ color: '#22c55e' }}
                    />{' '}
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    name="phone"
                    className="admin-form-control"
                    style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="contoh: 081234567890"
                  />
                  <small
                    style={{
                      color: '#64748b',
                      fontSize: '0.78rem',
                      marginTop: '0.35rem',
                      display: 'block',
                    }}
                  >
                    Nomor seluler/WhatsApp aktif yang dapat dihubungi.
                  </small>
                </div>
              </div>
            </div>

            {/* Section 2: Media Sosial Dinamis (Pilih Sosmed, Username, URL) */}
            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid #e2e8f0',
                }}
              >
                <h3
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--primary-deep)',
                    margin: 0,
                  }}
                >
                  2. Media Sosial (Maksimal 3 Akun)
                </h3>
                <button
                  type="button"
                  className="admin-btn admin-btn--outline admin-btn--sm"
                  onClick={handleAddSocial}
                  disabled={socials.length >= 3}
                  style={{
                    borderRadius: '50px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  <i className="fa-solid fa-plus" /> Tambah Media Sosial (
                  {socials.length}/3)
                </button>
              </div>

              {socials.length === 0 ? (
                <div
                  style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px dashed #cbd5e1',
                  }}
                >
                  <i
                    className="fa-solid fa-share-nodes"
                    style={{
                      fontSize: '1.8rem',
                      color: '#94a3b8',
                      marginBottom: '0.5rem',
                    }}
                  />
                  <p
                    style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}
                  >
                    Belum ada media sosial yang ditambahkan. Klik tombol{' '}
                    <strong>"+ Tambah Media Sosial"</strong> di atas jika ingin
                    menambahkan (maksimal 3 akun).
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {socials.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(180px, 1fr)) auto',
                        gap: '0.75rem',
                        alignItems: 'center',
                        background: '#f8fafc',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {/* 1. Pilih Sosmed */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#64748b',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Pilih Media Sosial
                        </label>
                        <select
                          className="admin-form-control"
                          style={{ fontSize: '0.9rem', fontWeight: 700 }}
                          value={item.platform}
                          onChange={(e) =>
                            handleSocialChange(idx, 'platform', e.target.value)
                          }
                        >
                          {PLATFORM_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.value}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 2. Username Sosmed */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#64748b',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Username
                        </label>
                        <input
                          type="text"
                          className="admin-form-control"
                          style={{ fontSize: '0.9rem' }}
                          value={item.username || ''}
                          onChange={(e) =>
                            handleSocialChange(idx, 'username', e.target.value)
                          }
                          placeholder="contoh: @pengurus_rawa"
                        />
                      </div>

                      {/* 3. URL Link Sosmed */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#64748b',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Tautan URL Website
                        </label>
                        <input
                          type="text"
                          className="admin-form-control"
                          style={{ fontSize: '0.9rem' }}
                          value={item.url || ''}
                          onChange={(e) =>
                            handleSocialChange(idx, 'url', e.target.value)
                          }
                          placeholder="https://..."
                        />
                      </div>

                      {/* 4. Tombol Hapus */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          paddingTop: '1.25rem',
                        }}
                      >
                        <button
                          type="button"
                          className="admin-btn admin-btn--outline"
                          onClick={() => handleRemoveSocial(idx)}
                          title="Hapus Media Sosial Ini"
                          style={{
                            color: '#ef4444',
                            borderColor: '#fca5a5',
                            padding: '0.65rem 0.9rem',
                          }}
                        >
                          <i className="fa-solid fa-trash-can" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <button
                type="submit"
                className="admin-btn admin-btn--primary"
                disabled={submitting}
                style={{
                  fontSize: '1rem',
                  padding: '0.85rem 2rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                }}
              >
                {submitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" /> Menyimpan
                    Data...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-floppy-disk" /> Simpan Perubahan
                    Profil
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PengurusProfilePage;
