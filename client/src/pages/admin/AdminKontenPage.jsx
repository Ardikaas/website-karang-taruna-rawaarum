import { useState, useEffect, useRef } from 'react';
import { fetchInfoItems, createInfoItem, updateInfoItem, deleteInfoItem, uploadImage } from '../../services/api';

const INITIAL_FORM = {
  title: '',
  description: '',
  type: 'kegiatan',
  customType: '',
  imageUrl: '',
  badge: '',
  linkText: 'Lihat Detail',
};

const TYPE_IMAGE_MAP = {
  loker: '/assets/lowongan_kerja.png',
  umkm: '/assets/potensi_umkm.png',
  pengumuman: '/assets/pengumuman.png',
  kegiatan: '/assets/info_kegiatan.png',
};

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

const AdminKontenPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Form & Modals State
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

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await fetchInfoItems();
      setItems(data);
    } catch (err) {
      setError('Gagal mengambil data konten.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleOpenCreate = () => {
    setForm({ ...INITIAL_FORM });
    setModalMode('create');
    setFormError('');
    setShowManualUrl(false);
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    const isStandardType = ['kegiatan', 'loker', 'umkm', 'pengumuman'].includes(item.type);
    setForm({
      title: item.title,
      description: item.description,
      type: isStandardType ? item.type : 'kustom',
      customType: isStandardType ? '' : item.type,
      imageUrl: item.imageUrl,
      badge: item.badge,
      linkText: item.linkText || 'Lihat Detail',
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
      setForm((prevForm) => ({ ...prevForm, imageUrl: res.imageUrl }));
    } catch (err) {
      setFormError(err.message || 'Gagal mengupload gambar.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const finalType = form.type === 'kustom' ? form.customType.trim() : form.type;
    if (!finalType) {
      setFormError('Kategori kustom wajib diisi.');
      return;
    }

    setSubmitting(true);

    const payload = { 
      ...form,
      type: finalType.toLowerCase()
    };
    
    // Set default illustration if custom image url is empty
    if (!payload.imageUrl) {
      payload.imageUrl = TYPE_IMAGE_MAP[payload.type] || TYPE_IMAGE_MAP.kegiatan;
    }

    // Set badge automatically if left empty
    if (!payload.badge) {
      payload.badge = payload.type === 'pengumuman' 
        ? 'Penting' 
        : payload.type.charAt(0).toUpperCase() + payload.type.slice(1);
    }

    // Set formatting for date
    payload.date = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    try {
      if (modalMode === 'create') {
        await createInfoItem(payload);
      } else {
        await updateInfoItem(activeId, payload);
      }
      setShowModal(false);
      loadItems();
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan konten.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteInfoItem(id);
      setDeleteConfirmId(null);
      loadItems();
    } catch (err) {
      alert(err.message || 'Gagal menghapus konten.');
    } finally {
      setDeleting(false);
    }
  };

  // Get dynamic unique categories for filter tabs
  const categoryTabs = ['all', ...new Set(items.map(item => item.type))];

  const filteredItems = items
    .filter((item) => {
      const matchesCategory = filterType === 'all' || item.type === filterType;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) || 
        (item.badge && item.badge.toLowerCase().includes(query)) ||
        item.type.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        // Fallback ordering if date parse yields NaN
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return dateB - dateA;
      } else if (sortBy === 'oldest') {
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return dateA - dateB;
      } else if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  if (loading && items.length === 0) {
    return (
      <div className="admin-loading-container">
        <i className="fa-solid fa-spinner fa-spin admin-spinner" />
        <p>Memuat data konten...</p>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Manajemen Konten</h1>
          <p className="admin-page-subtitle">Terbitkan dan kelola informasi Kegiatan, Loker, UMKM, Pengumuman, atau Kategori Kustom.</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={handleOpenCreate}>
          <i className="fa-solid fa-plus" /> Terbitkan Konten
        </button>
      </div>

      {error && (
        <div className="admin-alert admin-alert--error" style={{ marginBottom: '1.5rem' }}>
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Content Card */}
      <div className="admin-card">
        <div className="admin-card__header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #edf2f7' }}>
          <div className="admin-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
            {categoryTabs.map((type) => (
              <button
                key={type}
                className={`admin-tab-btn ${filterType === type ? 'active' : ''}`}
                onClick={() => setFilterType(type)}
              >
                {type === 'all' ? 'Semua' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <div className="admin-text-muted" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
            Menampilkan {filteredItems.length} dari {items.length} konten
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
              placeholder="Cari judul, rincian, atau badge..."
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
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="alphabetical">A - Z</option>
            </select>
          </div>
        </div>

        <div className="admin-card__body" style={{ padding: 0 }}>
          <div className="admin-table-wrapper">
            {filteredItems.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Gambar</th>
                    <th>Judul & Detail</th>
                    <th>Kategori</th>
                    <th>Tanggal Terbit</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item._id}>
                      <td style={{ width: '80px' }}>
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }}
                          onError={(e) => { e.target.src = '/assets/info_kegiatan.png' }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.title}</div>
                        <div className="admin-text-muted" style={{ fontSize: '0.8rem', maxWidth: '350px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {item.description}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${
                          item.type === 'pengumuman' ? 'error' :
                          item.type === 'loker' ? 'warning' :
                          item.type === 'umkm' ? 'success' :
                          'primary'
                        }`}>
                          {item.badge || item.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {item.date}
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
                  {searchQuery ? 'Tidak ada hasil pencarian yang cocok' : 'Tidak ada konten ditemukan'}
                </p>
                <p className="admin-text-muted" style={{ fontSize: '0.9rem', marginBottom: searchQuery ? '1rem' : '0' }}>
                  {searchQuery 
                    ? `Tidak ada konten yang cocok dengan kata kunci "${searchQuery}"` 
                    : 'Silakan terbitkan konten baru untuk menambah informasi.'}
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
                {modalMode === 'create' ? 'Terbitkan Konten Baru' : 'Edit Konten'}
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
                <label className="admin-form-label">Judul Informasi / Kegiatan</label>
                <input
                  type="text"
                  className="admin-form-control"
                  required
                  placeholder="Contoh: Rapat Koordinasi Agustusan / Pelatihan UMKM"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-form-label">Kategori Konten</label>
                  <select
                    className="admin-form-control"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="kegiatan">Kegiatan</option>
                    <option value="loker">Loker</option>
                    <option value="umkm">UMKM</option>
                    <option value="pengumuman">Pengumuman (Penting)</option>
                    <option value="kustom">+ Tambah Kategori Kustom...</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Teks Tombol Aksi</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="Lihat Detail / Lamar Loker / Hubungi Penjual"
                    value={form.linkText}
                    onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    Teks tombol di beranda (misal: "Lihat Detail", "Lamar Loker", "Hubungi Penjual").
                  </small>
                </div>
              </div>

              {/* Dynamic Input for Custom Category */}
              {form.type === 'kustom' && (
                <div className="admin-form-group">
                  <label className="admin-form-label">Nama Kategori Kustom Baru</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    required
                    placeholder="Contoh: Beasiswa / Donasi / Olahraga"
                    value={form.customType}
                    onChange={(e) => setForm({ ...form, customType: e.target.value })}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    Kategori baru ini akan otomatis tersimpan dan muncul sebagai tab filter baru.
                  </small>
                </div>
              )}

              <div className="admin-form-group">
                <label className="admin-form-label">Deskripsi Lengkap / Rincian</label>
                <RichTextEditor
                  value={form.description}
                  onChange={(val) => setForm({ ...form, description: val })}
                  placeholder="Tuliskan berita lengkap, syarat loker, detail UMKM atau rincian kegiatan..."
                />
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-form-label">Custom Badge (Opsional)</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="Biarkan kosong untuk default kategori"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    Label pita gambar (misal: "PENTING!", "Hot Loker", "Promo"). Kosongkan untuk default.
                  </small>
                </div>
              </div>

              {/* Styled Image Uploader Component */}
              <div className="admin-form-group">
                <label className="admin-form-label">Gambar Konten</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="admin-image-file"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="admin-image-file"
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
                          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Pilih File Gambar</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>JPG, PNG, WEBP (Maksimal 5MB)</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {form.imageUrl && (
                    <div style={{ position: 'relative', width: '100px', height: '70px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                      <img
                        src={form.imageUrl}
                        alt="Pratinjau"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/assets/info_kegiatan.png' }}
                      />
                      <button
                        type="button"
                        style={{
                          position: 'absolute',
                          top: '3px',
                          right: '3px',
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
                        title="Hapus Gambar"
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
                    {showManualUrl ? 'Gunakan Uploader File' : 'Atau Masukkan URL Gambar Manual'}
                  </button>

                  {showManualUrl && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <input
                        type="text"
                        className="admin-form-control"
                        placeholder="Contoh: /assets/gambar-kustom.jpg"
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
                    'Simpan Konten'
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
              <p>Apakah Anda yakin ingin menghapus konten ini secara permanen dari database?</p>
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

export default AdminKontenPage;
