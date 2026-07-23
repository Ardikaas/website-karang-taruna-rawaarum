import { useState, useEffect } from 'react';
import { fetchPartners, createPartner, updatePartner, deletePartner, uploadImage } from '../../services/api';

const INITIAL_FORM = {
  name: '',
  category: 'Industri & Swasta',
  description: '',
  logoUrl: '',
  websiteUrl: '#'
};

const AdminPartnerPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
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
      const data = await fetchPartners();
      setList(data);
    } catch (err) {
      setError('Gagal mengambil data mitra.');
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
      category: item.category || 'Industri & Swasta',
      description: item.description || '',
      logoUrl: item.logoUrl || '',
      websiteUrl: item.websiteUrl || '#',
    });
    setActiveId(item._id);
    setModalMode('edit');
    setFormError('');
    setShowManualUrl(false);
    setShowModal(true);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError('');

    try {
      const res = await uploadImage(file);
      setForm((prev) => ({ ...prev, logoUrl: res.imageUrl }));
    } catch (err) {
      setFormError(err.message || 'Gagal mengupload logo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (modalMode === 'create') {
        await createPartner(form);
      } else {
        await updatePartner(activeId, form);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan data mitra.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deletePartner(id);
      setDeleteConfirmId(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Gagal menghapus mitra.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading && list.length === 0) {
    return (
      <div className="admin-loading-container">
        <i className="fa-solid fa-spinner fa-spin admin-spinner" />
        <p>Memuat data kemitraan...</p>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Manajemen Kemitraan & Sponsorship</h1>
          <p className="admin-page-subtitle">Kelola daftar instansi, perusahaan mitra, dan lembaga pendukung Karang Taruna.</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={handleOpenCreate}>
          <i className="fa-solid fa-plus" /> Tambah Mitra Baru
        </button>
      </div>

      {error && (
        <div className="admin-alert admin-alert--error" style={{ marginBottom: '1.5rem' }}>
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {/* Partner Table */}
      <div className="admin-card">
        <div className="admin-card__header" style={{ justifyContent: 'space-between' }}>
          <h2 className="admin-card__title">Daftar Instansi & Perusahaan Mitra ({list.length})</h2>
        </div>
        <div className="admin-card__body" style={{ padding: 0 }}>
          <div className="admin-table-wrapper">
            {list.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Nama Instansi / Mitra</th>
                    <th>Kategori Mitra</th>
                    <th>Deskripsi Singkat</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item) => (
                    <tr key={item._id}>
                      <td style={{ width: '80px' }}>
                        {item.logoUrl ? (
                          <img 
                            src={item.logoUrl} 
                            alt={item.name} 
                            style={{ width: '50px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.08)', background: '#fff', padding: '2px' }}
                            onError={(e) => { e.target.src = '/assets/info_kegiatan.png' }}
                          />
                        ) : (
                          <div style={{ width: '50px', height: '40px', borderRadius: '4px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <i className="fa-solid fa-building" />
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{item.name}</strong>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge--primary">
                          {item.category}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {item.description || '-'}
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
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty-state" style={{ padding: '4rem 2rem' }}>
                <i className="fa-solid fa-handshake" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <p style={{ fontWeight: '500' }}>Belum ada mitra terdaftar</p>
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
                {modalMode === 'create' ? 'Tambah Mitra Baru' : 'Edit Data Mitra'}
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

              <div className="admin-form-group">
                <label className="admin-form-label">Nama Instansi / Perusahaan</label>
                <input
                  type="text"
                  className="admin-form-control"
                  required
                  placeholder="Contoh: PT. Cilegon Power Perkasa"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-form-label">Kategori Mitra</label>
                  <select
                    className="admin-form-control"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="Pemerintahan">Pemerintahan</option>
                    <option value="Industri & Swasta">Industri & Swasta</option>
                    <option value="Lembaga Pendidikan">Lembaga Pendidikan</option>
                    <option value="UMKM Local">UMKM Lokal</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Link Website (Opsional)</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="https://..."
                    value={form.websiteUrl}
                    onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Deskripsi Sinergi / Kerjasama</label>
                <textarea
                  className="admin-form-control"
                  rows="3"
                  placeholder="Jelaskan bentuk sinergi atau dukungan dari mitra ini..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Styled Image Uploader Component for Logo */}
              <div className="admin-form-group">
                <label className="admin-form-label">Logo Mitra (Opsional)</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="admin-logo-file"
                      style={{ display: 'none' }}
                      onChange={handleLogoUpload}
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="admin-logo-file"
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
                      }}
                    >
                      {uploadingImage ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                          <i className="fa-solid fa-spinner fa-spin" style={{ color: 'var(--accent)', fontSize: '1.25rem' }} />
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Mengupload logo...</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                          <i className="fa-solid fa-cloud-arrow-up" style={{ color: '#94a3b8', fontSize: '1.35rem' }} />
                          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Pilih File Logo</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>PNG, JPG, WEBP (Maksimal 5MB)</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {form.logoUrl && (
                    <div style={{ position: 'relative', width: '90px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', padding: '4px', background: '#fff' }}>
                      <img
                        src={form.logoUrl}
                        alt="Preview Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      <button
                        type="button"
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: 'rgba(239, 68, 68, 0.9)',
                          border: 'none',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem'
                        }}
                        onClick={() => setForm({ ...form, logoUrl: '' })}
                        title="Hapus Logo"
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn--sm"
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent)', padding: 0, fontWeight: '600', textDecoration: 'underline' }}
                    onClick={() => setShowManualUrl(!showManualUrl)}
                  >
                    {showManualUrl ? 'Gunakan Uploader File' : 'Atau Masukkan URL Logo Manual'}
                  </button>

                  {showManualUrl && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <input
                        type="text"
                        className="admin-form-control"
                        placeholder="Contoh: /assets/logo-mitra.png"
                        value={form.logoUrl}
                        onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
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
                    'Simpan Mitra'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
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
              <p>Apakah Anda yakin ingin menghapus data mitra ini?</p>
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

export default AdminPartnerPage;
