import { useState, useEffect, useRef } from 'react';
import {
  fetchInfoItems,
  createInfoItem,
  updateInfoItem,
  deleteInfoItem,
  uploadImage,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const INITIAL_FORM = {
  title: '',
  description: '',
  type: 'kegiatan',
  customType: '',
  imageUrl: '',
  images: [],
  badge: '',
  linkText: 'Lihat Detail',
  contactType: 'default',
  contactUrl: '',
  whatsappText: '',
  categoryType: 'produk',
  address: '',
  whatsapp: '',
  priceRange: '',
  certificationsStr: '',
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
    <div
      style={{
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <style>{`
        .custom-rich-editor[contenteditable]:empty:before {
          content: attr(placeholder);
          color: #94a3b8;
          cursor: text;
        }
      `}</style>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          padding: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="admin-btn admin-btn--outline admin-btn--sm"
          style={{
            padding: '0.4rem 0.6rem',
            border: '1px solid #e2e8f0',
            background: '#fff',
            cursor: 'pointer',
          }}
          title="Tebal (Bold)"
        >
          <i className="fa-solid fa-bold" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="admin-btn admin-btn--outline admin-btn--sm"
          style={{
            padding: '0.4rem 0.6rem',
            border: '1px solid #e2e8f0',
            background: '#fff',
            cursor: 'pointer',
          }}
          title="Miring (Italic)"
        >
          <i className="fa-solid fa-italic" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          className="admin-btn admin-btn--outline admin-btn--sm"
          style={{
            padding: '0.4rem 0.6rem',
            border: '1px solid #e2e8f0',
            background: '#fff',
            cursor: 'pointer',
          }}
          title="Garis Bawah (Underline)"
        >
          <i className="fa-solid fa-underline" />
        </button>
        <div
          style={{ width: '1px', background: '#e2e8f0', margin: '0 0.25rem' }}
        />
        <button
          type="button"
          onClick={addLink}
          className="admin-btn admin-btn--outline admin-btn--sm"
          style={{
            padding: '0.4rem 0.6rem',
            border: '1px solid #e2e8f0',
            background: '#fff',
            cursor: 'pointer',
          }}
          title="Sisipkan Link"
        >
          <i className="fa-solid fa-link" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="admin-btn admin-btn--outline admin-btn--sm"
          style={{
            padding: '0.4rem 0.6rem',
            border: '1px solid #e2e8f0',
            background: '#fff',
            cursor: 'pointer',
          }}
          title="Daftar Poin (List)"
        >
          <i className="fa-solid fa-list-ul" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('removeFormat')}
          className="admin-btn admin-btn--outline admin-btn--sm"
          style={{
            padding: '0.4rem 0.6rem',
            border: '1px solid #e2e8f0',
            background: '#fff',
            cursor: 'pointer',
          }}
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
          color: '#334155',
        }}
        placeholder={placeholder}
      />
    </div>
  );
};

const AdminKontenPage = () => {
  const { user } = useAuth();
  const isPengurus = user?.role === 'pengurus';

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
    const isStandardType = ['kegiatan', 'loker', 'umkm', 'pengumuman'].includes(
      item.type
    );
    setForm({
      title: item.title,
      description: item.description,
      type: isStandardType ? item.type : 'kustom',
      customType: isStandardType ? '' : item.type,
      imageUrl: item.imageUrl,
      images: Array.isArray(item.images) ? [...item.images] : [],
      badge: item.badge,
      linkText: item.linkText || 'Lihat Detail',
      contactType: item.contactType || (item.whatsapp ? 'whatsapp' : 'default'),
      contactUrl: item.contactUrl || '',
      whatsappText: item.whatsappText || '',
      categoryType: item.categoryType || 'produk',
      address: item.address || '',
      whatsapp: item.whatsapp || '',
      priceRange: item.priceRange || '',
      certificationsStr: Array.isArray(item.certifications)
        ? item.certifications.join(', ')
        : '',
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

  const handleMultipleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    setFormError('');

    try {
      const uploadPromises = files.map((file) => uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.imageUrl);

      setForm((prevForm) => ({
        ...prevForm,
        images: [...(prevForm.images || []), ...newUrls],
      }));
    } catch (err) {
      setFormError(err.message || 'Gagal mengupload beberapa gambar galeri.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Judul dan Deskripsi Konten wajib diisi.');
      return;
    }

    setSubmitting(true);

    const payload = {
      ...form,
      type: form.type.toLowerCase(),
      images: Array.isArray(form.images) ? form.images : [],
    };

    // Set default illustration if custom image url is empty
    if (!payload.imageUrl) {
      payload.imageUrl =
        TYPE_IMAGE_MAP[payload.type] || TYPE_IMAGE_MAP.kegiatan;
    }

    // Set linkText and badge automatically based on category
    if (payload.type === 'loker') {
      payload.linkText = 'Lamar Loker';
      payload.badge = 'Loker';
    } else if (payload.type === 'pengumuman') {
      payload.linkText = 'Lihat Pengumuman';
      payload.badge = 'Penting';
    } else {
      payload.linkText = 'Lihat Kegiatan';
      payload.badge = 'Kegiatan';
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

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        'Apakah Anda yakin ingin menghapus SEMUA data konten? Seluruh data dummy/lama akan dibersihkan.'
      )
    )
      return;
    setDeleting(true);
    try {
      for (const item of items) {
        await deleteInfoItem(item._id);
      }
      loadItems();
    } catch (err) {
      alert('Gagal menghapus beberapa/semua konten.');
    } finally {
      setDeleting(false);
    }
  };

  // Get dynamic unique categories for filter tabs (Excluding UMKM which has its own menu)
  const allUniqueTypes = [
    ...new Set(
      items
        .map((item) => item.type)
        .filter((type) => type && type.toLowerCase() !== 'umkm')
    ),
  ];
  const categoryTabs = isPengurus
    ? ['all', 'kegiatan']
    : ['all', ...allUniqueTypes];

  const filteredItems = (items || [])
    .filter((item) => {
      if (!item) return false;
      const typeStr = (item.type || '').toLowerCase();
      // Exclude UMKM from main content list (handled in /admin/umkm)
      if (typeStr === 'umkm') {
        return false;
      }
      // If pengurus, restrict access ONLY to content created by themselves
      if (isPengurus) {
        if (typeStr !== 'kegiatan') return false;
        const createdById =
          typeof item.createdBy === 'object'
            ? item.createdBy?._id
            : item.createdBy;

        // If no createdBy at all (old data), hide from pengurus
        if (!createdById) return false;

        const userId = user?._id || user?.id;
        const userMatches =
          (userId && createdById.toString() === userId.toString()) ||
          (item.createdBy?.email &&
            user?.email &&
            item.createdBy.email === user.email) ||
          (item.createdBy?.username &&
            user?.username &&
            item.createdBy.username === user.username);

        if (!userMatches) return false;
      }
      const matchesCategory = filterType === 'all' || item.type === filterType;
      const query = searchQuery.toLowerCase().trim();
      const titleStr = (item.title || '').toLowerCase();
      const descStr = (item.description || '').toLowerCase();
      const badgeStr = (item.badge || '').toLowerCase();

      const matchesSearch =
        !query ||
        titleStr.includes(query) ||
        descStr.includes(query) ||
        badgeStr.includes(query) ||
        typeStr.includes(query);

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
      } else if (sortBy === 'oldest') {
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
      } else if (sortBy === 'alphabetical') {
        return (a.title || '').localeCompare(b.title || '');
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
          <p className="admin-page-subtitle">
            Terbitkan dan kelola informasi Kegiatan, Loker, Pengumuman, atau
            Kategori Kustom.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {items.length > 0 && (
            <button
              className="admin-btn admin-btn--outline"
              onClick={handleDeleteAll}
              disabled={deleting}
              style={{
                color: '#ef4444',
                borderColor: '#fca5a5',
                background: '#fff',
              }}
              title="Bersihkan seluruh data konten"
            >
              <i className="fa-solid fa-trash-can" /> Kosongkan Semua Konten
            </button>
          )}
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleOpenCreate}
          >
            <i className="fa-solid fa-plus" /> Terbitkan Konten Baru
          </button>
        </div>
      </div>

      {error && (
        <div
          className="admin-alert admin-alert--error"
          style={{ marginBottom: '1.5rem' }}
        >
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Content Card */}
      <div className="admin-card">
        <div
          className="admin-card__header"
          style={{
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1px solid #edf2f7',
          }}
        >
          <div
            className="admin-tabs"
            style={{ marginBottom: 0, borderBottom: 'none' }}
          >
            {categoryTabs.map((type) => (
              <button
                key={type}
                className={`admin-tab-btn ${filterType === type ? 'active' : ''}`}
                onClick={() => setFilterType(type)}
              >
                {type === 'all'
                  ? 'Semua'
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <div
            className="admin-text-muted"
            style={{ fontSize: '0.85rem', fontWeight: '500' }}
          >
            Menampilkan {filteredItems.length} dari {items.length} konten
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #edf2f7',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            backgroundColor: '#f8fafc',
          }}
        >
          <div
            style={{
              position: 'relative',
              flex: '1',
              minWidth: '250px',
              maxWidth: '400px',
            }}
          >
            <i
              className="fa-solid fa-magnifying-glass"
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              className="admin-form-control"
              placeholder="Cari judul, rincian, atau badge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '2.5rem',
                height: '40px',
                fontSize: '0.85rem',
              }}
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
                  cursor: 'pointer',
                }}
              >
                <i
                  className="fa-solid fa-circle-xmark"
                  style={{ fontSize: '1rem' }}
                />
              </button>
            )}
          </div>

          <div
            style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
          >
            <span
              style={{
                fontSize: '0.85rem',
                color: '#64748b',
                fontWeight: '500',
              }}
            >
              <i className="fa-solid fa-arrow-down-wide-short" /> Urutkan:
            </span>
            <select
              className="admin-form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '160px',
                height: '40px',
                padding: '0 0.75rem',
                fontSize: '0.85rem',
              }}
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
                          style={{
                            width: '60px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid rgba(0,0,0,0.1)',
                          }}
                          onError={(e) => {
                            e.target.src = '/assets/info_kegiatan.png';
                          }}
                        />
                      </td>
                      <td>
                        <div
                          style={{
                            fontWeight: '600',
                            color: 'var(--text-main)',
                          }}
                        >
                          {item.title}
                        </div>
                        <div
                          className="admin-text-muted"
                          style={{
                            fontSize: '0.8rem',
                            maxWidth: '350px',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {(item.description || '').replace(/<[^>]*>?/gm, '')}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`admin-badge admin-badge--${
                            item.type === 'pengumuman'
                              ? 'error'
                              : item.type === 'loker'
                                ? 'warning'
                                : item.type === 'umkm'
                                  ? 'success'
                                  : 'primary'
                          }`}
                        >
                          {item.badge || item.type}
                        </span>
                      </td>
                      <td
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
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
              <div
                className="admin-empty-state"
                style={{ padding: '4rem 2rem', textAlign: 'center' }}
              >
                <i
                  className="fa-solid fa-magnifying-glass"
                  style={{
                    fontSize: '3rem',
                    color: 'var(--text-muted)',
                    marginBottom: '1rem',
                  }}
                />
                <p style={{ fontWeight: '500', color: 'var(--text-main)' }}>
                  {searchQuery
                    ? 'Tidak ada hasil pencarian yang cocok'
                    : 'Tidak ada konten ditemukan'}
                </p>
                <p
                  className="admin-text-muted"
                  style={{
                    fontSize: '0.9rem',
                    marginBottom: searchQuery ? '1rem' : '0',
                  }}
                >
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
          <div
            className="admin-modal"
            style={{
              maxWidth: '780px',
              width: '92%',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
          >
            <div
              className="admin-modal__header"
              style={{
                background: '#0f172a',
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <h2
                className="admin-modal__title"
                style={{
                  color: '#fff',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <i
                  className="fa-solid fa-bullhorn"
                  style={{ color: 'var(--accent)' }}
                />
                {modalMode === 'create'
                  ? 'Terbitkan Informasi / Kegiatan Baru'
                  : 'Edit Konten Informasi'}
              </h2>
              <button
                className="admin-modal__close"
                onClick={() => setShowModal(false)}
                style={{
                  color: '#94a3b8',
                  fontSize: '1.25rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="admin-modal__body"
              style={{
                padding: '1.75rem',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
            >
              {formError && (
                <div
                  className="admin-alert admin-alert--error"
                  style={{ marginBottom: '1.25rem' }}
                >
                  <i className="fa-solid fa-circle-exclamation" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Judul Informasi / Kegiatan */}
              <div
                className="admin-form-group"
                style={{ marginBottom: '1.25rem' }}
              >
                <label
                  className="admin-form-label"
                  style={{
                    fontWeight: 700,
                    color: 'var(--primary-deep)',
                    marginBottom: '0.4rem',
                    display: 'block',
                  }}
                >
                  Judul Informasi / Kegiatan *
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  required
                  placeholder="Contoh: Rapat Koordinasi Panitia / Pelatihan Kerja Pemuda"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{ borderRadius: '8px', padding: '0.65rem 0.9rem' }}
                />
              </div>

              {/* 2. Grid 2 Column: Kategori Konten & Upload Gambar */}
              <div
                className="admin-grid-2"
                style={{ gap: '1.25rem', marginBottom: '1.25rem' }}
              >
                <div className="admin-form-group">
                  <label
                    className="admin-form-label"
                    style={{
                      fontWeight: 700,
                      color: 'var(--primary-deep)',
                      marginBottom: '0.4rem',
                      display: 'block',
                    }}
                  >
                    Kategori Konten *
                  </label>
                  <select
                    className="admin-form-control"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={{ borderRadius: '8px', padding: '0.65rem 0.9rem' }}
                  >
                    <option value="kegiatan">Kegiatan &amp; Agenda</option>
                    {!isPengurus && (
                      <option value="loker">Lowongan Kerja (Loker)</option>
                    )}
                    {!isPengurus && (
                      <option value="pengumuman">Pengumuman Penting</option>
                    )}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label
                    className="admin-form-label"
                    style={{
                      fontWeight: 700,
                      color: 'var(--primary-deep)',
                      marginBottom: '0.4rem',
                      display: 'block',
                    }}
                  >
                    Gambar Utama Konten
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1 }}>
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
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '0.6rem 0.9rem',
                          border: '2px dashed #cbd5e1',
                          cursor: 'pointer',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#475569',
                        }}
                      >
                        {uploadingImage ? (
                          <>
                            <i
                              className="fa-solid fa-spinner fa-spin"
                              style={{ color: 'var(--accent)' }}
                            />
                            <span>Mengupload...</span>
                          </>
                        ) : (
                          <>
                            <i
                              className="fa-solid fa-cloud-arrow-up"
                              style={{ color: 'var(--accent)' }}
                            />
                            <span>Pilih Gambar Konten</span>
                          </>
                        )}
                      </label>
                    </div>

                    {form.imageUrl && (
                      <div
                        style={{
                          position: 'relative',
                          width: '65px',
                          height: '42px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: '1px solid #cbd5e1',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={form.imageUrl}
                          alt="Pratinjau"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            e.target.src = '/assets/info_kegiatan.png';
                          }}
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
                            fontSize: '0.65rem',
                          }}
                          onClick={() => setForm({ ...form, imageUrl: '' })}
                          title="Hapus Gambar"
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3b. Galeri Multi-Foto Tambahan */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <label
                    className="admin-form-label"
                    style={{
                      fontWeight: 700,
                      color: 'var(--primary-deep)',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <i
                      className="fa-solid fa-images"
                      style={{ color: 'var(--accent)' }}
                    />
                    Galeri Foto Tambahan ({(form.images || []).length} Foto)
                  </label>
                </div>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#64748b',
                    marginTop: 0,
                    marginBottom: '1rem',
                  }}
                >
                  Tambahkan beberapa foto pendukung. Foto akan tampil sebagai
                  tayangan slider interaktif yang berputar otomatis di halaman
                  detail.
                </p>

                {/* Multi Upload Input */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <label
                    className="admin-btn admin-btn--outline"
                    style={{
                      cursor: 'pointer',
                      padding: '0.55rem 1rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    <i
                      className="fa-solid fa-cloud-arrow-up"
                      style={{ marginRight: '6px' }}
                    />
                    Upload Beberapa Foto Sekaligus
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMultipleImagesUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>

                {/* Gallery Thumbnails List */}
                {form.images && form.images.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(90px, 1fr))',
                      gap: '0.75rem',
                      marginTop: '0.75rem',
                    }}
                  >
                    {form.images.map((url, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          height: '75px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid #cbd5e1',
                          background: '#fff',
                        }}
                      >
                        <img
                          src={url}
                          alt={`Foto ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            e.target.src = '/assets/info_kegiatan.png';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx),
                            }))
                          }
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.9)',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                          }}
                          title="Hapus foto dari galeri"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Deskripsi Lengkap / Rincian */}
              <div
                className="admin-form-group"
                style={{ marginBottom: '1.5rem' }}
              >
                <label
                  className="admin-form-label"
                  style={{
                    fontWeight: 700,
                    color: 'var(--primary-deep)',
                    marginBottom: '0.4rem',
                    display: 'block',
                  }}
                >
                  Deskripsi Lengkap / Rincian Konten *
                </label>
                <RichTextEditor
                  value={form.description}
                  onChange={(val) => setForm({ ...form, description: val })}
                  placeholder="Tuliskan berita lengkap, syarat loker, atau rincian kegiatan..."
                />
              </div>

              {/* 5. Kustomisasi Tombol "Hubungi Kami" */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '0.5rem',
                  }}
                >
                  <i
                    className="fa-solid fa-headset"
                    style={{ color: 'var(--accent)', fontSize: '1.1rem' }}
                  />
                  <h4
                    style={{
                      margin: 0,
                      fontWeight: 800,
                      color: 'var(--primary-deep)',
                      fontSize: '1rem',
                    }}
                  >
                    Kustomisasi Tombol "Hubungi Kami"
                  </h4>
                </div>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#64748b',
                    marginTop: 0,
                    marginBottom: '1rem',
                  }}
                >
                  Tentukan aksi tombol "Hubungi Kami" pada halaman detail konten
                  ini (WhatsApp langsung, link web/form kustom, atau halaman
                  kontak website).
                </p>

                <div
                  className="admin-form-group"
                  style={{ marginBottom: '1rem' }}
                >
                  <label
                    className="admin-form-label"
                    style={{
                      fontWeight: 700,
                      color: 'var(--primary-deep)',
                      marginBottom: '0.4rem',
                      display: 'block',
                      fontSize: '0.85rem',
                    }}
                  >
                    Tipe Tujuan Kontak
                  </label>
                  <select
                    className="admin-form-control"
                    value={form.contactType}
                    onChange={(e) =>
                      setForm({ ...form, contactType: e.target.value })
                    }
                    style={{ borderRadius: '8px', padding: '0.6rem 0.9rem' }}
                  >
                    <option value="default">
                      Halaman Kontak Website (Default /kontak)
                    </option>
                    <option value="whatsapp">
                      WhatsApp Langsung (Nomor & Template Chat)
                    </option>
                    <option value="link">
                      Link Web / Form Kustom (URL Luar)
                    </option>
                  </select>
                </div>

                {form.contactType === 'whatsapp' && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      background: '#fff',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <div className="admin-form-group">
                      <label
                        className="admin-form-label"
                        style={{
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          marginBottom: '0.3rem',
                          display: 'block',
                        }}
                      >
                        Nomor WhatsApp (Contoh: 081234567890)
                      </label>
                      <input
                        type="text"
                        className="admin-form-control"
                        placeholder="Contoh: 081234567890"
                        value={form.whatsapp}
                        onChange={(e) =>
                          setForm({ ...form, whatsapp: e.target.value })
                        }
                        style={{
                          borderRadius: '8px',
                          padding: '0.55rem 0.8rem',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          marginTop: '4px',
                          display: 'block',
                        }}
                      >
                        Kosongkan jika ingin menggunakan nomor WhatsApp utama
                        Karang Taruna Rawa Arum.
                      </span>
                    </div>

                    <div className="admin-form-group">
                      <label
                        className="admin-form-label"
                        style={{
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          marginBottom: '0.3rem',
                          display: 'block',
                        }}
                      >
                        Template Chat WhatsApp
                      </label>
                      <textarea
                        className="admin-form-control"
                        rows={3}
                        placeholder="Halo Admin Karang Taruna Rawa Arum, saya mau bertanya mengenai: {title}"
                        value={form.whatsappText}
                        onChange={(e) =>
                          setForm({ ...form, whatsappText: e.target.value })
                        }
                        style={{
                          borderRadius: '8px',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          marginTop: '4px',
                          display: 'block',
                        }}
                      >
                        Gunakan tag <code>{'{title}'}</code> untuk menyisipkan
                        judul konten ini secara otomatis.
                      </span>
                    </div>
                  </div>
                )}

                {form.contactType === 'link' && (
                  <div
                    style={{
                      background: '#fff',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <div className="admin-form-group">
                      <label
                        className="admin-form-label"
                        style={{
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          marginBottom: '0.3rem',
                          display: 'block',
                        }}
                      >
                        Tautan Link Tujuan (URL Kustom)
                      </label>
                      <input
                        type="url"
                        className="admin-form-control"
                        placeholder="https://forms.google.com/..."
                        value={form.contactUrl}
                        onChange={(e) =>
                          setForm({ ...form, contactUrl: e.target.value })
                        }
                        style={{
                          borderRadius: '8px',
                          padding: '0.55rem 0.8rem',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          marginTop: '4px',
                          display: 'block',
                        }}
                      >
                        Pengunjung akan diarahkan ke URL ini saat menekan tombol
                        "Hubungi Kami".
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <button
                  type="button"
                  className="admin-btn admin-btn--outline"
                  onClick={() => setShowModal(false)}
                  style={{ borderRadius: '8px', padding: '0.6rem 1.25rem' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={submitting}
                  style={{
                    borderRadius: '8px',
                    padding: '0.6rem 1.5rem',
                    fontWeight: 700,
                  }}
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" /> Menyimpan...
                    </>
                  ) : modalMode === 'create' ? (
                    <>
                      <i className="fa-solid fa-paper-plane" /> Terbitkan Konten
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-floppy-disk" /> Simpan Perubahan
                    </>
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
              <button
                className="admin-modal__close"
                onClick={() => setDeleteConfirmId(null)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="admin-modal__body" style={{ padding: '1.5rem' }}>
              <p>
                Apakah Anda yakin ingin menghapus konten ini secara permanen
                dari database?
              </p>
              <div
                className="admin-modal__footer"
                style={{ marginTop: '1.5rem', padding: 0, border: 'none' }}
              >
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
                    <>
                      <i className="fa-solid fa-spinner fa-spin" /> Menghapus...
                    </>
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
