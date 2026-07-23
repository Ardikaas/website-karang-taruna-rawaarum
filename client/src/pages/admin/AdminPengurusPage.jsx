import { useState, useEffect } from 'react';
import { fetchPengurus, createPengurus, updatePengurus, deletePengurus, uploadImage } from '../../services/api';
import { getAvatarPhoto } from '../../constants/structureData';

const INITIAL_FORM = {
  name: '',
  role: 'Anggota',
  category: 'bidang',
  level: 3,
  bidangId: 'kaderisasi',
  bidangTitle: 'Pemberdayaan Aparatur Organisasi & Kaderisasi',
  imageUrl: '',
  isKoordinator: false
};

const DIVISION_MAP = [
  { id: 'kaderisasi', title: 'Pemberdayaan Aparatur Organisasi & Kaderisasi' },
  { id: 'advokasi', title: 'Advokasi, HAM & Lingkungan Hidup' },
  { id: 'hubungan', title: 'Hubungan Antar-Lembaga, Masyarakat, dan Industri' },
  { id: 'perempuan', title: 'Pemberdayaan Perempuan dan Anak' },
  { id: 'media', title: 'Media, Data, dan Informasi' },
  { id: 'seni', title: 'Seni, Budaya, dan Olahraga' },
  { id: 'ekonomi', title: 'Kemandirian Organisasi dan Ekonomi Kreatif' },
  { id: 'pendidikan', title: 'Pendidikan dan Keagamaan' },
  { id: 'sosial', title: 'Sosial, Kemanusiaan, dan Mitigasi Bencana' },
  { id: 'kustom', title: 'Bidang Kustom...' }
];

const AdminPengurusPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Form & Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Image Uploading States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchPengurus();
      setList(data);
    } catch (err) {
      setError('Gagal mengambil data pengurus.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setForm({ ...INITIAL_FORM });
    setModalMode('create');
    setFormError('');
    setShowManualUrl(false);
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setForm({
      name: item.name,
      role: item.role,
      category: item.category,
      level: item.level || 3,
      bidangId: item.bidangId || 'kaderisasi',
      bidangTitle: item.bidangTitle || '',
      imageUrl: item.imageUrl || '',
      isKoordinator: item.isKoordinator || false,
    });
    setActiveId(item._id);
    setModalMode('edit');
    setFormError('');
    setShowManualUrl(false);
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError('');

    try {
      const res = await uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: res.imageUrl }));
    } catch (err) {
      setFormError(err.message || 'Gagal mengupload foto.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCategoryChange = (cat) => {
    const defaultRole = cat === 'pembina' ? 'Pelindung / Pembina' : cat === 'harian' ? 'Ketua' : 'Anggota';
    setForm({
      ...form,
      category: cat,
      role: defaultRole,
      isKoordinator: false
    });
  };

  const handleDivisionChange = (divId) => {
    const divObj = DIVISION_MAP.find(d => d.id === divId);
    setForm({
      ...form,
      bidangId: divId,
      bidangTitle: divObj ? divObj.title : '',
      role: form.isKoordinator ? 'Koordinator Bidang' : 'Anggota'
    });
  };

  const handleKoorCheckbox = (isChecked) => {
    setForm({
      ...form,
      isKoordinator: isChecked,
      role: isChecked ? 'Koordinator Bidang' : 'Anggota'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    const payload = { ...form };

    // Format inputs depending on category
    if (payload.category === 'pembina') {
      payload.level = 1;
      payload.bidangId = '';
      payload.bidangTitle = '';
      payload.isKoordinator = false;
    } else if (payload.category === 'harian') {
      payload.bidangId = '';
      payload.bidangTitle = '';
      payload.isKoordinator = false;
    } else {
      payload.level = 3;
      if (payload.bidangId === 'kustom' && !payload.bidangTitle) {
        setFormError('Nama bidang kustom wajib diisi.');
        setSubmitting(false);
        return;
      }
    }

    try {
      if (modalMode === 'create') {
        await createPengurus(payload);
      } else {
        await updatePengurus(activeId, payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan data pengurus.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deletePengurus(id);
      setDeleteConfirmId(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Gagal menghapus data.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredList = filterCategory === 'all'
    ? list
    : list.filter(item => item.category === filterCategory);

  if (loading && list.length === 0) {
    return (
      <div className="admin-loading-container">
        <i className="fa-solid fa-spinner fa-spin admin-spinner" />
        <p>Memuat data struktur pengurus...</p>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Manajemen Struktur Organisasi</h1>
          <p className="admin-page-subtitle">Kelola daftar pengurus, jabatan, foto profil, dan divisi bidang kerja Karang Taruna.</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={handleOpenCreate}>
          <i className="fa-solid fa-plus" /> Tambah Pengurus
        </button>
      </div>

      {error && (
        <div className="admin-alert admin-alert--error" style={{ marginBottom: '1.5rem' }}>
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Filter */}
      <div className="admin-card">
        <div className="admin-card__header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="admin-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
            {['all', 'pembina', 'harian', 'bidang'].map((cat) => (
              <button
                key={cat}
                className={`admin-tab-btn ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat === 'all' ? 'Semua' : cat === 'pembina' ? 'Pembina/Pelindung' : cat === 'harian' ? 'Pengurus Harian' : 'Bidang Kerja'}
              </button>
            ))}
          </div>
          <div className="admin-text-muted" style={{ fontSize: '0.9rem' }}>
            Menampilkan {filteredList.length} orang pengurus
          </div>
        </div>

        <div className="admin-card__body" style={{ padding: 0 }}>
          <div className="admin-table-wrapper">
            {filteredList.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Nama Pengurus</th>
                    <th>Jabatan</th>
                    <th>Kategori</th>
                    <th>Divisi Bidang</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((item) => {
                    const fallbackAvatar = getAvatarPhoto(item.name);
                    const photoSrc = item.imageUrl || fallbackAvatar;
                    return (
                      <tr key={item._id}>
                        <td style={{ width: '70px' }}>
                          <img 
                            src={photoSrc} 
                            alt={item.name} 
                            style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.05)' }}
                            onError={(e) => { e.target.src = fallbackAvatar }}
                          />
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-main)' }}>{item.name}</strong>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                            {item.role}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-badge admin-badge--${
                            item.category === 'pembina' ? 'success' :
                            item.category === 'harian' ? 'primary' :
                            'accent-light'
                          }`}>
                            {item.category === 'pembina' ? 'Pembina' : item.category === 'harian' ? 'Harian' : 'Bidang'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '250px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {item.category === 'bidang' ? (item.bidangTitle || item.bidangId) : '-'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button 
                              className="admin-action-btn admin-action-btn--edit" 
                              title="Edit"
                              onClick={() => handleOpenEdit(item)}
                            >
                              <i className="fa-solid fa-pen-to-square" />
                            </button>
                            <button 
                              className="admin-action-btn admin-action-btn--delete" 
                              title="Hapus"
                              onClick={() => setDeleteConfirmId(item._id)}
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
            ) : (
              <div className="admin-empty-state" style={{ padding: '4rem 2rem' }}>
                <i className="fa-solid fa-sitemap" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <p style={{ fontWeight: '500' }}>Tidak ada data pengurus ditemukan</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">
                {modalMode === 'create' ? 'Tambah Pengurus Baru' : 'Edit Data Pengurus'}
              </h2>
              <button className="admin-modal__close" onClick={() => setShowModal(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-modal__body">
              {formError && (
                <div className="admin-alert admin-alert--error" style={{ marginBottom: '1.25rem' }}>
                  <i className="fa-solid fa-circle-exclamation" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-form-label">Nama Lengkap</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    required
                    placeholder="Contoh: Rifki Amrullah"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Kategori Jabatan</label>
                  <select
                    className="admin-form-control"
                    value={form.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="pembina">Pelindung / Pembina Kelurahan</option>
                    <option value="harian">Pengurus Harian (Ketua, Sekr, Bend, dll)</option>
                    <option value="bidang">Pengurus Divisi Bidang Kerja</option>
                  </select>
                </div>
              </div>

              {/* ── Sub-Form: Pengurus Harian ── */}
              {form.category === 'harian' && (
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Jabatan Spesifik</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      required
                      placeholder="Contoh: Wakil Ketua I, Sekretaris"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Tingkat Hirarki (Untuk Posisi Tabel)</label>
                    <select
                      className="admin-form-control"
                      value={form.level}
                      onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) })}
                    >
                      <option value={1}>Tingkat 1 (Ketua)</option>
                      <option value={2}>Tingkat 2 (Wakil Ketua)</option>
                      <option value={3}>Tingkat 3 (Sekretaris, Bendahara, dll)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ── Sub-Form: Pembina / Pelindung ── */}
              {form.category === 'pembina' && (
                <div className="admin-form-group">
                  <label className="admin-form-label">Jabatan Pembina</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    required
                    placeholder="Contoh: Pelindung / Pembina"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </div>
              )}

              {/* ── Sub-Form: Bidang Kerja ── */}
              {form.category === 'bidang' && (
                <>
                  <div className="admin-grid-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Divisi Bidang Kerja</label>
                      <select
                        className="admin-form-control"
                        value={form.bidangId}
                        onChange={(e) => handleDivisionChange(e.target.value)}
                      >
                        {DIVISION_MAP.map((d) => (
                          <option key={d.id} value={d.id}>{d.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '1.75rem' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        <input
                          type="checkbox"
                          checked={form.isKoordinator}
                          onChange={(e) => handleKoorCheckbox(e.target.checked)}
                          style={{ width: '17px', height: '17px', cursor: 'pointer' }}
                        />
                        Sebagai Koordinator Bidang
                      </label>
                    </div>
                  </div>

                  {form.bidangId === 'kustom' && (
                    <div className="admin-form-group">
                      <label className="admin-form-label">Nama Bidang Kustom</label>
                      <input
                        type="text"
                        className="admin-form-control"
                        required
                        placeholder="Contoh: Pemberdayaan Minat Bakat Kustom"
                        value={form.bidangTitle}
                        onChange={(e) => setForm({ ...form, bidangTitle: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="admin-form-group">
                    <label className="admin-form-label">Jabatan Divisi</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      required
                      placeholder="Contoh: Anggota, Koordinator Bidang"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Styled Image Uploader Component */}
              <div className="admin-form-group">
                <label className="admin-form-label">Foto Profil Pengurus (Opsional)</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  {/* Styled Drag & Drop / Selection Area */}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="admin-photo-file"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="admin-photo-file"
                      className="admin-form-control"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.25rem',
                        border: '2px dashed #cbd5e1',
                        cursor: 'pointer',
                        textAlign: 'center',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        transition: 'border-color 0.2s ease',
                      }}
                    >
                      {uploadingImage ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                          <i className="fa-solid fa-spinner fa-spin" style={{ color: 'var(--accent)', fontSize: '1.25rem' }} />
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Mengupload file...</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                          <i className="fa-solid fa-cloud-arrow-up" style={{ color: '#94a3b8', fontSize: '1.35rem' }} />
                          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Pilih File Foto</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>JPG, PNG, WEBP (Maksimal 5MB)</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Thumbnail Preview Area */}
                  {(form.imageUrl || form.name) && (
                    <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #cbd5e1' }}>
                      <img
                        src={form.imageUrl || getAvatarPhoto(form.name || 'Anonymous')}
                        alt="Pratinjau"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {form.imageUrl && (
                        <button
                          type="button"
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.9)',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem'
                          }}
                          onClick={() => setForm({ ...form, imageUrl: '' })}
                          title="Hapus Gambar kustom"
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Option to manual URL input */}
                <div style={{ marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn--sm"
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent)', padding: 0, fontWeight: '600', textDecoration: 'underline' }}
                    onClick={() => setShowManualUrl(!showManualUrl)}
                  >
                    {showManualUrl ? 'Gunakan Uploader File' : 'Atau Masukkan URL Foto Manual'}
                  </button>

                  {showManualUrl && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <input
                        type="text"
                        className="admin-form-control"
                        placeholder="Contoh: /assets/foto-pengurus.jpg"
                        value={form.imageUrl}
                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-modal__footer">
                <button 
                  type="button" 
                  className="admin-btn admin-btn--outline" 
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="admin-btn admin-btn--primary" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <><i className="fa-solid fa-spinner fa-spin" /> Menyimpan...</>
                  ) : (
                    'Simpan Anggota'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal--sm">
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">Konfirmasi Hapus</h2>
              <button className="admin-modal__close" onClick={() => setDeleteConfirmId(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="admin-modal__body" style={{ padding: '1.5rem' }}>
              <p>Apakah Anda yakin ingin menghapus pengurus ini secara permanen dari database?</p>
              <div className="admin-modal__footer" style={{ marginTop: '1.5rem', padding: 0, border: 'none' }}>
                <button 
                  className="admin-btn admin-btn--outline" 
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={deleting}
                >
                  Batal
                </button>
                <button 
                  className="admin-btn admin-btn--danger" 
                  onClick={() => handleDelete(deleteConfirmId)}
                  disabled={deleting}
                >
                  {deleting ? (
                    <><i className="fa-solid fa-spinner fa-spin" /> Menghapus...</>
                  ) : (
                    'Ya, Hapus'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPengurusPage;
