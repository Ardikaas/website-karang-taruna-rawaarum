import { useState, useEffect, useRef } from 'react';
import { fetchPengurus, createPengurus, updatePengurus, deletePengurus, uploadImage } from '../../services/api';
import { getAvatarPhoto } from '../../constants/structureData';

const INITIAL_FORM = {
  name: '',
  role: 'Anggota Bidang',
  customRole: '',
  customCategoryType: 'bidang',
  customRoleLevel: 3,
  bidangId: 'kaderisasi',
  bidangTitle: 'Pemberdayaan Aparatur Organisasi & Kaderisasi',
  imageUrl: '',
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

const STANDARD_ROLES = [
  { label: 'Ketua', category: 'harian', level: 1, isKoordinator: false },
  { label: 'Wakil Ketua', category: 'harian', level: 2, isKoordinator: false },
  { label: 'Sekretaris', category: 'harian', level: 3, isKoordinator: false },
  { label: 'Bendahara', category: 'harian', level: 3, isKoordinator: false },
  { label: 'Koordinator Bidang', category: 'bidang', level: 3, isKoordinator: true },
  { label: 'Anggota Bidang', category: 'bidang', level: 3, isKoordinator: false },
  { label: 'Pelindung / Pembina Kelurahan', category: 'pembina', level: 1, isKoordinator: false }
];

const AdminPengurusPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivision, setFilterDivision] = useState('all');
  const [sortBy, setSortBy] = useState('level');

  // Form & Modal States
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
    const isStandard = STANDARD_ROLES.some(r => r.label === item.role);
    setForm({
      name: item.name,
      role: isStandard ? item.role : 'kustom',
      customRole: isStandard ? '' : item.role,
      customCategoryType: item.category || 'bidang',
      customRoleLevel: item.level || 3,
      bidangId: item.bidangId || 'kaderisasi',
      bidangTitle: item.bidangTitle || '',
      imageUrl: item.imageUrl || '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const finalRole = form.role === 'kustom' ? form.customRole.trim() : form.role;
    if (!finalRole) {
      setFormError('Nama jabatan wajib diisi.');
      return;
    }

    let category = 'bidang';
    let level = 3;
    let isKoordinator = false;

    if (form.role !== 'kustom') {
      const standardObj = STANDARD_ROLES.find(r => r.label === form.role);
      if (standardObj) {
        category = standardObj.category;
        level = standardObj.level;
        isKoordinator = standardObj.isKoordinator;
      }
    } else {
      category = form.customCategoryType;
      level = category === 'pembina' ? 1 : form.customRoleLevel;
      isKoordinator = category === 'bidang' && (finalRole.toLowerCase().includes('koordinator') || finalRole.toLowerCase().includes('kabid') || finalRole.toLowerCase().includes('ketua bidang'));
    }

    const payload = {
      name: form.name,
      role: finalRole,
      category,
      level,
      bidangId: category === 'bidang' ? form.bidangId : '',
      bidangTitle: category === 'bidang' ? form.bidangTitle : '',
      imageUrl: form.imageUrl,
      isKoordinator: category === 'bidang' ? isKoordinator : false
    };

    if (category === 'bidang' && payload.bidangId === 'kustom' && !payload.bidangTitle) {
      setFormError('Nama bidang kustom wajib diisi.');
      return;
    }

    setSubmitting(true);

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

  // Get dynamic unique categories from pengurus list
  const categories = ['all', ...new Set(list.map(item => item.category))];

  const filteredList = list
    .filter((item) => {
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesDivision = filterDivision === 'all' || item.bidangId === filterDivision;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        item.name.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query) ||
        (item.bidangTitle && item.bidangTitle.toLowerCase().includes(query));
      return matchesCategory && matchesDivision && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'level') {
        const catOrder = { pembina: 1, harian: 2, bidang: 3 };
        const catA = catOrder[a.category] || 99;
        const catB = catOrder[b.category] || 99;
        if (catA !== catB) return catA - catB;
        const lvlA = a.level || 99;
        const lvlB = b.level || 99;
        if (lvlA !== lvlB) return lvlA - lvlB;
        if (a.isKoordinator !== b.isKoordinator) {
          return a.isKoordinator ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'alphabetical') {
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
        <div className="admin-card__header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #edf2f7' }}>
          <div className="admin-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
            {['all', 'pembina', 'harian', 'bidang'].map((cat) => (
              <button
                key={cat}
                className={`admin-tab-btn ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  setFilterCategory(cat);
                  setFilterDivision('all');
                }}
              >
                {cat === 'all' ? 'Semua' : cat === 'pembina' ? 'Pembina/Pelindung' : cat === 'harian' ? 'Pengurus Harian' : 'Bidang Kerja'}
              </button>
            ))}
          </div>
          <div className="admin-text-muted" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
            Menampilkan {filteredList.length} dari {list.length} pengurus
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
              placeholder="Cari nama pengurus, jabatan, atau divisi..."
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

          {/* Right Selectors: Division & Sort */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {filterCategory === 'bidang' && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                  <i className="fa-solid fa-sitemap" /> Divisi:
                </span>
                <select
                  className="admin-form-control"
                  value={filterDivision}
                  onChange={(e) => setFilterDivision(e.target.value)}
                  style={{ width: '180px', height: '40px', padding: '0 0.5rem', fontSize: '0.85rem' }}
                >
                  <option value="all">Semua Divisi</option>
                  {DIVISION_MAP.filter(d => d.id !== 'kustom').map((d) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                <i className="fa-solid fa-arrow-down-wide-short" /> Urutkan:
              </span>
              <select
                className="admin-form-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: '150px', height: '40px', padding: '0 0.5rem', fontSize: '0.85rem' }}
              >
                <option value="level">Hirarki (Level)</option>
                <option value="alphabetical">Nama (A - Z)</option>
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
              </select>
            </div>
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
              <div className="admin-empty-state" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <p style={{ fontWeight: '500', color: 'var(--text-main)' }}>
                  {searchQuery ? 'Tidak ada hasil pencarian yang cocok' : 'Tidak ada data pengurus ditemukan'}
                </p>
                <p className="admin-text-muted" style={{ fontSize: '0.9rem', marginBottom: searchQuery ? '1rem' : '0' }}>
                  {searchQuery 
                    ? `Tidak ada pengurus yang cocok dengan kata kunci "${searchQuery}"` 
                    : 'Silakan klik "Tambah Pengurus" untuk menambahkan anggota baru.'}
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
                  <label className="admin-form-label">Jabatan Pengurus</label>
                  <select
                    className="admin-form-control"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="Ketua">Ketua</option>
                    <option value="Wakil Ketua">Wakil Ketua</option>
                    <option value="Sekretaris">Sekretaris</option>
                    <option value="Bendahara">Bendahara</option>
                    <option value="Koordinator Bidang">Koordinator Bidang</option>
                    <option value="Anggota Bidang">Anggota Bidang</option>
                    <option value="Pelindung / Pembina Kelurahan">Pelindung / Pembina Kelurahan</option>
                    <option value="kustom">+ Tambah Jabatan Kustom...</option>
                  </select>
                </div>
              </div>

              {/* Custom Role Fields */}
              {form.role === 'kustom' && (
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Nama Jabatan Kustom</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      required
                      placeholder="Contoh: Wakil Sekretaris I, Humas"
                      value={form.customRole}
                      onChange={(e) => setForm({ ...form, customRole: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Penempatan Struktur / Kategori</label>
                    <select
                      className="admin-form-control"
                      value={form.customCategoryType}
                      onChange={(e) => setForm({ ...form, customCategoryType: e.target.value })}
                    >
                      <option value="harian">Pengurus Harian (Ketua, Sekr, Bend, dll)</option>
                      <option value="bidang">Pengurus Divisi Bidang Kerja</option>
                      <option value="pembina">Pelindung / Pembina Kelurahan</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Show Division Selector if category is 'bidang' */}
              {((form.role !== 'kustom' && ['Koordinator Bidang', 'Anggota Bidang'].includes(form.role)) || 
                (form.role === 'kustom' && form.customCategoryType === 'bidang')) && (
                <>
                  <div className="admin-grid-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Divisi Bidang Kerja</label>
                      <select
                        className="admin-form-control"
                        value={form.bidangId}
                        onChange={(e) => {
                          const divId = e.target.value;
                          const divObj = DIVISION_MAP.find(d => d.id === divId);
                          setForm({
                            ...form,
                            bidangId: divId,
                            bidangTitle: divObj ? divObj.title : ''
                          });
                        }}
                      >
                        {DIVISION_MAP.map((d) => (
                          <option key={d.id} value={d.id}>{d.title}</option>
                        ))}
                      </select>
                    </div>

                    {form.role === 'kustom' && (
                      <div className="admin-form-group">
                        <label className="admin-form-label">Tingkat Hirarki Kustom</label>
                        <select
                          className="admin-form-control"
                          value={form.customRoleLevel}
                          onChange={(e) => setForm({ ...form, customRoleLevel: parseInt(e.target.value) })}
                        >
                          <option value={3}>Anggota / Koordinator Biasa (Level 3)</option>
                          <option value={2}>Pimpinan Bidang (Level 2)</option>
                        </select>
                      </div>
                    )}
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
                </>
              )}

              {/* Styled Image Uploader Component */}
              <div className="admin-form-group">
                <label className="admin-form-label">Foto Profil Pengurus (Opsional)</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
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
