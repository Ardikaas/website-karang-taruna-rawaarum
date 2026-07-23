import { useState, useEffect } from 'react';
import { changePassword, fetchSiteSettings, updateSiteSettings } from '../../services/api';

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('security'); // 'security' | 'contact' | 'hero'

  // ── Password Form State ──
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
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
    visiText: '',
    misiList: [],
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    mapsEmbedUrl: '',
    socialInstagram: '',
    socialFacebook: '',
    socialYoutube: ''
  });

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Load site settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setSettingsLoading(true);
        const data = await fetchSiteSettings();
        setSettings({
          heroTitle: data.heroTitle || '',
          heroSubtitle: data.heroSubtitle || '',
          heroDescription: data.heroDescription || '',
          visiText: data.visiText || '',
          misiList: data.misiList || [],
          address: data.address || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          mapsEmbedUrl: data.mapsEmbedUrl || '',
          socialInstagram: data.socialInstagram || '',
          socialFacebook: data.socialFacebook || '',
          socialYoutube: data.socialYoutube || ''
        });
      } catch (err) {
        setSettingsError('Gagal memuat pengaturan situs.');
        console.error(err);
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
      setPassError(err.message || 'Gagal merubah password. Pastikan password lama Anda benar.');
    } finally {
      setPassSubmitting(false);
    }
  };

  // ── Handle Settings Submission ──
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');
    setSettingsSubmitting(true);

    try {
      const updated = await updateSiteSettings(settings);
      setSettingsSuccess('Pengaturan situs berhasil diperbarui dan disimpan!');
      setSettings(updated);
    } catch (err) {
      setSettingsError(err.message || 'Gagal menyimpan pengaturan situs.');
    } finally {
      setSettingsSubmitting(false);
    }
  };

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
          <p className="admin-page-subtitle">Kelola keamanan akun admin, informasi kontak, dan konten teks utama situs.</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="admin-tabs" style={{ borderBottom: '1px solid #edf2f7', marginBottom: '1.5rem' }}>
        <button
          className={`admin-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <i className="fa-solid fa-shield-halved" /> Keamanan Akun
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <i className="fa-solid fa-address-book" /> Informasi Kontak & Footer
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          <i className="fa-solid fa-bullhorn" /> Beranda & Visi Misi
        </button>
      </div>

      {/* ── TAB 1: SECURITY (PASSWORD) ── */}
      {activeTab === 'security' && (
        <div className="admin-grid-2" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
          <div className="admin-card">
            <div className="admin-card__header">
              <h2 className="admin-card__title">
                <i className="fa-solid fa-key" /> Ubah Password Admin
              </h2>
            </div>
            <div className="admin-card__body">
              {passError && (
                <div className="admin-alert admin-alert--error" style={{ marginBottom: '1.5rem' }}>
                  <i className="fa-solid fa-circle-exclamation" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="admin-alert" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.15)', marginBottom: '1.5rem' }}>
                  <i className="fa-solid fa-circle-check" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="old-password">Password Lama</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="old-password"
                      type={showOld ? 'text' : 'password'}
                      className="admin-form-control"
                      required
                      placeholder="Masukkan password lama..."
                      value={passForm.oldPassword}
                      onChange={(e) => setPassForm({ ...passForm, oldPassword: e.target.value })}
                      style={{ paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      className="admin-password-toggle"
                      onClick={() => setShowOld(!showOld)}
                      style={{ color: '#64748b' }}
                      tabIndex={-1}
                    >
                      <i className={`fa-solid ${showOld ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="new-password">Password Baru</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="new-password"
                      type={showNew ? 'text' : 'password'}
                      className="admin-form-control"
                      required
                      placeholder="Masukkan password baru (min. 6 karakter)..."
                      value={passForm.newPassword}
                      onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                      style={{ paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      className="admin-password-toggle"
                      onClick={() => setShowNew(!showNew)}
                      style={{ color: '#64748b' }}
                      tabIndex={-1}
                    >
                      <i className={`fa-solid ${showNew ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="confirm-password">Konfirmasi Password Baru</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      className="admin-form-control"
                      required
                      placeholder="Ulangi password baru Anda..."
                      value={passForm.confirmPassword}
                      onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                      style={{ paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      className="admin-password-toggle"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{ color: '#64748b' }}
                      tabIndex={-1}
                    >
                      <i className={`fa-solid ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`} />
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
                      <><i className="fa-solid fa-spinner fa-spin" /> Memperbarui...</>
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
                <i className="fa-solid fa-shield-halved" /> Panduan Keamanan Akun
              </h2>
            </div>
            <div className="admin-card__body" style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '1rem' }}>Demi menjaga keamanan portal admin Karang Taruna Kelurahan Rawa Arum, ikuti panduan berikut saat merubah password:</p>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li>
                  <strong>Panjang Minimal</strong>: Password baru minimal 6 karakter.
                </li>
                <li>
                  <strong>Jaga Kredensial</strong>: Jangan bagikan akun login admin ini kepada siapa pun kecuali pengurus resmi Karang Taruna.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: CONTACT & FOOTER ── */}
      {activeTab === 'contact' && (
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">
              <i className="fa-solid fa-address-book" /> Pengaturan Kontak & Footer
            </h2>
          </div>
          <div className="admin-card__body">
            {settingsError && (
              <div className="admin-alert admin-alert--error" style={{ marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-circle-exclamation" />
                <span>{settingsError}</span>
              </div>
            )}

            {settingsSuccess && (
              <div className="admin-alert" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.15)', marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-circle-check" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSettingsSubmit}>
              <div className="admin-form-group">
                <label className="admin-form-label">Alamat Lengkap Sekretariat</label>
                <textarea
                  className="admin-form-control"
                  rows="3"
                  required
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                />
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-form-label">Nomor Telepon Kantor</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    required
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Nomor WhatsApp Call Center (Gunakan kode 62...)</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    required
                    placeholder="Contoh: 6281234567890"
                    value={settings.whatsapp}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
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
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">URL Embed Google Maps (Iframe Src)</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.mapsEmbedUrl}
                    onChange={(e) => setSettings({ ...settings, mapsEmbedUrl: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #edf2f7', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)' }}>Link Tautan Media Sosial</h3>
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label"><i className="fa-brands fa-instagram" /> Instagram</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={settings.socialInstagram}
                      onChange={(e) => setSettings({ ...settings, socialInstagram: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label"><i className="fa-brands fa-facebook" /> Facebook</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={settings.socialFacebook}
                      onChange={(e) => setSettings({ ...settings, socialFacebook: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group" style={{ maxWidth: '500px' }}>
                  <label className="admin-form-label"><i className="fa-brands fa-youtube" /> YouTube</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.socialYoutube}
                    onChange={(e) => setSettings({ ...settings, socialYoutube: e.target.value })}
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
                    <><i className="fa-solid fa-spinner fa-spin" /> Menyimpan...</>
                  ) : (
                    'Simpan Kontak & Footer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 3: HERO & VISI MISI ── */}
      {activeTab === 'hero' && (
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">
              <i className="fa-solid fa-bullhorn" /> Pengaturan Konten Beranda & Visi Misi
            </h2>
          </div>
          <div className="admin-card__body">
            {settingsError && (
              <div className="admin-alert admin-alert--error" style={{ marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-circle-exclamation" />
                <span>{settingsError}</span>
              </div>
            )}

            {settingsSuccess && (
              <div className="admin-alert" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.15)', marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-circle-check" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSettingsSubmit}>
              <div className="admin-form-group">
                <label className="admin-form-label">Judul Utama Banner Beranda (Hero Title)</label>
                <input
                  type="text"
                  className="admin-form-control"
                  required
                  value={settings.heroTitle}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Tagline / Subtitle Banner</label>
                <input
                  type="text"
                  className="admin-form-control"
                  required
                  value={settings.heroSubtitle}
                  onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Deskripsi Pengantar Utama Beranda</label>
                <textarea
                  className="admin-form-control"
                  rows="3"
                  required
                  value={settings.heroDescription}
                  onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                />
              </div>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #edf2f7', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)' }}>Pernyataan Visi & Misi</h3>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Teks Visi Organisasi</label>
                  <textarea
                    className="admin-form-control"
                    rows="3"
                    required
                    value={settings.visiText}
                    onChange={(e) => setSettings({ ...settings, visiText: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="admin-form-label" style={{ marginBottom: 0 }}>Poin-Poin Misi Organisasi</label>
                    <button type="button" className="admin-btn admin-btn--outline admin-btn--sm" onClick={addMisiItem}>
                      <i className="fa-solid fa-plus" /> Tambah Poin Misi
                    </button>
                  </div>

                  {settings.misiList.map((misi, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
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
                          style={{ height: '40px', width: '40px', flexShrink: 0 }}
                          onClick={() => removeMisiItem(idx)}
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={settingsSubmitting}
                >
                  {settingsSubmitting ? (
                    <><i className="fa-solid fa-spinner fa-spin" /> Menyimpan...</>
                  ) : (
                    'Simpan Beranda & Visi Misi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
