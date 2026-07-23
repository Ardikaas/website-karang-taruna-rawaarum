import { useState, useEffect, useRef } from 'react';
import { fetchPartners, createPartner, updatePartner, deletePartner, uploadImage } from '../../services/api';

const INITIAL_FORM = {
  name: '',
  category: 'Industri & Swasta',
  customCategory: '',
  description: '',
  logoUrl: '',
  websiteUrl: '#'
};

const STANDARD_CATEGORIES = [
  'Pemerintahan',
  'Industri & Swasta',
  'Lembaga Pendidikan',
  'UMKM Lokal'
];

// Custom Light-weight Rich Text Editor component
const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);

  // Sync initial value only when editor content differs from state
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const executeCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = (e) => {
    onChange(e.target.innerHTML);
  };

  const addLink = () => {
    const url = prompt('Masukkan URL Link (contoh: https://google.com):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  return (
    <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
      <style>{`
        .custom-rich-editor[contenteditable]:empty:before {
          content: attr(placeholder);
          color: #94a3b8;
          cursor: text;
        }
      `}</style>
      {/* Toolbar */}
      <div style={{ 
        display: 'flex', 
        gap: '0.25rem', 
        padding: '0.5rem', 
        borderBottom: '1px solid #e2e8f0', 
        background: '#f8fafc',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="admin-btn admin-btn--outline admin-btn--sm"
          style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
          title="Tebal (Bold)"
        >
          <i className="fa-solid fa-bold" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="admin-btn admin-btn--outline admin-btn--sm"
          style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
          title="Miring (Italic)"
        >
          <i className="fa-solid fa-italic" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          className="admin-btn admin-btn--outline admin-btn--sm"
          style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
          title="Garis Bawah (Underline)"
        >
          <i className="fa-solid fa-underline" />
        </button>
        <div style={{ width: '1px', background: '#e2e8f0', margin: '0 0.25rem' }} />
        <button
          type="button"
          onClick={addLink}
          className="admin-btn admin-btn--outline admin-btn--sm"
          style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
          title="Sisipkan Link"
        >
          <i className="fa-solid fa-link" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="admin-btn admin-btn--outline admin-btn--sm"
          style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
          title="Daftar Poin (List)"
        >
          <i className="fa-solid fa-list-ul" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('removeFormat')}
          className="admin-btn admin-btn--outline admin-btn--sm"
          style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
          title="Hapus Format"
        >
          <i className="fa-solid fa-text-slash" />
        </button>
      </div>

      {/* Content Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="custom-rich-editor"
        style={{
          minHeight: '150px',
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '0.75rem 1rem',
          outline: 'none',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          color: '#334155'
        }}
        placeholder={placeholder}
      />
    </div>
  );
};

const AdminPartnerPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('alphabetical');

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
    const isStandard = STANDARD_CATEGORIES.includes(item.category);
    setForm({
      name: item.name,
      category: isStandard ? item.category : 'kustom',
      customCategory: isStandard ? '' : item.category,
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

    const finalCategory = form.category === 'kustom' ? form.customCategory.trim() : form.category;
    if (!finalCategory) {
      setFormError('Kategori mitra wajib diisi.');
      return;
    }

    setSubmitting(true);

    const payload = {
      name: form.name,
      category: finalCategory,
      description: form.description,
      logoUrl: form.logoUrl,
      websiteUrl: form.websiteUrl
    };

    try {
      if (modalMode === 'create') {
        await createPartner(payload);
      } else {
        await updatePartner(activeId, payload);
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

  // Get dynamic unique categories from partner list
  const categories = ['all', ...new Set(list.map(item => item.category || 'Lainnya'))];

  const filteredList = list
    .filter((item) => {
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      return 0;
    });

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
        <div className="admin-card__header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #edf2f7' }}>
          <div className="admin-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`admin-tab-btn ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat === 'all' ? 'Semua Mitra' : cat}
              </button>
            ))}
          </div>
          <div className="admin-text-muted" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
            Menampilkan {filteredList.length} dari {list.length} mitra
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div style={{ 
          padding: '1rem 1.5rem', 
          borderBottom: '1px solid #edf2f7', 
          display: 'flex', 
          gap: '1rem', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap',
          backgroundColor: '#f8fafc'
        }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ 
              position: 'absolute', 
              left: '1rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#94a3b8' 
            }} />
            <input
              type="text"
              className="admin-form-control"
              placeholder="Cari nama instansi, deskripsi, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem', height: '40px', fontSize: '0.85rem' }}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                style={{ 
                  position: 'absolute', 
                  right: '1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  color: '#94a3b8', 
                  cursor: 'pointer' 
                }}
              >
                <i className="fa-solid fa-circle-xmark" style={{ fontSize: '1rem' }} />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
              <i className="fa-solid fa-arrow-down-wide-short" /> Urutkan:
            </span>
            <select
              className="admin-form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: '160px', height: '40px', padding: '0 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="alphabetical">Nama (A - Z)</option>
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </select>
          </div>
        </div>

        <div className="admin-card__body" style={{ padding: 0 }}>
          <div className="admin-table-wrapper">
            {filteredList.length > 0 ? (
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
                  {filteredList.map((item) => (
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
                      <td>
                        <div 
                          style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} 
                          dangerouslySetInnerHTML={{ __html: item.description || '-' }}
                        />
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
              <div className="admin-empty-state" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <p style={{ fontWeight: '500', color: 'var(--text-main)' }}>
                  {searchQuery ? 'Tidak ada hasil pencarian yang cocok' : 'Belum ada mitra terdaftar'}
                </p>
                <p className="admin-text-muted" style={{ fontSize: '0.9rem', marginBottom: searchQuery ? '1rem' : '0' }}>
                  {searchQuery 
                    ? `Tidak ada mitra yang cocok dengan kata kunci "${searchQuery}"` 
                    : 'Silakan klik "Tambah Mitra Baru" untuk mendaftarkan mitra pertama.'}
                </p>
                {searchQuery && (
                  <button 
                    className="admin-btn admin-btn--outline admin-btn--sm"
                    onClick={() => setSearchQuery('')}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Reset Pencarian
                  </button>
                )}
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
                    {STANDARD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="kustom">+ Tambah Kategori Lainnya...</option>
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

              {/* Custom Category Input Field */}
              {form.category === 'kustom' && (
                <div className="admin-form-group">
                  <label className="admin-form-label">Nama Kategori Kemitraan Baru</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    required
                    placeholder="Contoh: CSR / Swasta / BUMN / Media Partner"
                    value={form.customCategory}
                    onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
                  />
                </div>
              )}

              <div className="admin-form-group">
                <label className="admin-form-label">Deskripsi Sinergi / Kerjasama (Toolbar Format Interaktif)</label>
                <RichTextEditor
                  value={form.description}
                  onChange={(val) => setForm({ ...form, description: val })}
                  placeholder="Jelaskan bentuk sinergi atau dukungan dari mitra ini..."
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
