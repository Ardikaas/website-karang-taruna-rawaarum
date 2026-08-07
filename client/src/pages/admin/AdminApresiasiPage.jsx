import { useState, useEffect } from 'react';
import {
  fetchAllAchievements,
  createAchievement,
  updateAchievement,
  toggleAchievementStatus,
  deleteAchievement,
  uploadImage,
} from '../../services/api';
import { compressImageIfNeeded } from '../../utils/imageCompressor';

const CATEGORY_OPTIONS = [
  { value: 'pendidikan', label: '🎓 Pendidikan / Wisuda' },
  { value: 'akademik', label: '📖 Akademik & Sidang Skripsi' },
  { value: 'pernikahan', label: '💍 Pernikahan & Momen Spesial' },
  { value: 'prestasi', label: '🏆 Prestasi & Kejuaraan' },
  { value: 'lainnya', label: '🌟 Apresiasi Lainnya' },
];

const AdminApresiasiPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    memberName: '',
    title: '',
    category: 'prestasi',
    message: '',
    imageUrl: '',
    date: '',
    whatsapp: '',
    isActive: true,
  });

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAllAchievements();
      setAchievements(data);
    } catch (err) {
      setError(err.message || 'Gagal memuat data apresiasi anggota.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
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
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      memberName: item.memberName || '',
      title: item.title || '',
      category: item.category || 'prestasi',
      message: item.message || '',
      imageUrl: item.imageUrl || '',
      date: item.date || '',
      whatsapp: item.whatsapp || '',
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const compressedFile = await compressImageIfNeeded(file);
      const res = await uploadImage(compressedFile);
      const uploadedUrl =
        res.url || res.fileUrl || res.imageUrl || res.path || '';
      setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
    } catch (err) {
      alert(err.message || 'Gagal mengunggah foto apresiasi.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.memberName || !formData.title) {
      alert('Nama anggota dan judul pencapaian wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        await updateAchievement(editingItem._id, formData);
      } else {
        await createAchievement(formData);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan data apresiasi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleAchievementStatus(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Gagal mengubah status apresiasi.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAchievement(id);
      setDeleteConfirmId(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Gagal menghapus apresiasi.');
    }
  };

  // Filtered List
  const filteredAchievements = achievements.filter((item) => {
    const matchCat =
      categoryFilter === 'all' || item.category === categoryFilter;
    const matchSearch =
      !searchQuery ||
      item.memberName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="admin-page-container">
      {/* Header Bar */}
      <div className="admin-header-actions">
        <div>
          <h1 className="admin-page-title">
            <i className="fa-solid fa-trophy" /> Kelola Apresiasi Anggota
          </h1>
          <p className="admin-page-subtitle">
            Kelola banner ucapan apresiasi & kebanggaan atas pencapaian anggota
            Karang Taruna (Wisuda, Sidang, Pernikahan, Rangking, dsb.).
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <i className="fa-solid fa-plus" /> Tambah Apresiasi Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-filter-bar" style={{ marginBottom: '1.5rem' }}>
        <div
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}
        >
          <div
            className="admin-search-box"
            style={{ flex: 1, minWidth: '220px' }}
          >
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="text"
              placeholder="Cari nama anggota atau judul pencapaian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="admin-select-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="admin-loading-state">
          <i className="fa-solid fa-circle-notch fa-spin" />
          <p>Memuat data apresiasi anggota...</p>
        </div>
      ) : error ? (
        <div className="admin-error-state">
          <i className="fa-solid fa-circle-exclamation" />
          <p>{error}</p>
        </div>
      ) : filteredAchievements.length === 0 ? (
        <div className="admin-empty-state">
          <i className="fa-solid fa-trophy" />
          <p>Belum ada data apresiasi anggota yang cocok.</p>
        </div>
      ) : (
        <div className="admin-grid-cards">
          {filteredAchievements.map((item) => {
            const isCatOption = CATEGORY_OPTIONS.find(
              (c) => c.value === item.category
            );
            return (
              <div key={item._id} className="admin-achievement-card">
                {/* Header Image & Status Badge */}
                <div className="admin-ach-img-wrapper">
                  <img
                    src={item.imageUrl || '/assets/potensi_umkm.png'}
                    alt={item.memberName}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/potensi_umkm.png';
                    }}
                  />
                  <span
                    className={`admin-ach-status-badge ${
                      item.isActive ? 'active' : 'inactive'
                    }`}
                  >
                    {item.isActive
                      ? '● Aktif (Tampil)'
                      : '○ Nonaktif (Sembunyi)'}
                  </span>
                </div>

                {/* Body Content */}
                <div className="admin-ach-body">
                  <div className="admin-ach-category">
                    {isCatOption?.label || item.category}
                  </div>
                  <h3 className="admin-ach-title">{item.title}</h3>
                  <div className="admin-ach-member">
                    <i className="fa-solid fa-user-check" /> {item.memberName}
                  </div>
                  {item.date && (
                    <div className="admin-ach-date">
                      <i className="fa-regular fa-calendar" /> {item.date}
                    </div>
                  )}

                  <p className="admin-ach-msg">"{item.message}"</p>

                  {/* Actions */}
                  <div className="admin-ach-actions">
                    <button
                      className={`btn btn-sm ${
                        item.isActive
                          ? 'btn-outline-warning'
                          : 'btn-outline-success'
                      }`}
                      onClick={() => handleToggleStatus(item._id)}
                    >
                      {item.isActive ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleOpenEditModal(item)}
                    >
                      <i className="fa-solid fa-pen-to-square" /> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setDeleteConfirmId(item._id)}
                    >
                      <i className="fa-solid fa-trash" /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h3>
                {editingItem
                  ? 'Edit Apresiasi Anggota'
                  : 'Tambah Apresiasi Baru'}
              </h3>
              <button
                className="admin-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="admin-modal-form">
              <div className="form-group">
                <label>Nama Anggota *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Rizky, S.T."
                  value={formData.memberName}
                  onChange={(e) =>
                    setFormData({ ...formData, memberName: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Judul Pencapaian *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lulus Sidang Skripsi & Gelar Sarjana Teknik"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div
                className="form-row"
                style={{ display: 'flex', gap: '1rem' }}
              >
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Kategori Pencapaian</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tanggal / Momen</label>
                  <input
                    type="text"
                    placeholder="Contoh: 15 Agustus 2026"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Ucapan & Doa Apresiasi</label>
                <textarea
                  rows="3"
                  placeholder="Masukkan ucapan apresiasi & doa kebanggaan dari Karang Taruna..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Foto Anggota / Momen</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="URL Foto atau unggah gambar..."
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    style={{ flex: 1 }}
                  />
                  <label
                    className="btn btn-outline"
                    style={{ cursor: 'pointer' }}
                  >
                    {uploading ? 'Mengunggah...' : 'Unggah Foto'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Nomor WhatsApp Anggota (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: 081234567890 (untuk tombol ucapan langsung)"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp: e.target.value })
                  }
                />
              </div>

              <div className="form-group-checkbox">
                <label
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  <span>Tampilkan Banner di Beranda (Aktif)</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || uploading}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Apresiasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="admin-modal-overlay">
          <div
            className="admin-modal-box"
            style={{ maxWidth: '420px', textAlign: 'center' }}
          >
            <i
              className="fa-solid fa-triangle-exclamation"
              style={{
                fontSize: '3rem',
                color: 'var(--danger)',
                marginBottom: '1rem',
              }}
            />
            <h3>Hapus Data Apresiasi?</h3>
            <p
              style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}
            >
              Tindakan ini tidak dapat dibatalkan. Banner apresiasi ini akan
              dihapus permanen.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
              }}
            >
              <button
                className="btn btn-outline"
                onClick={() => setDeleteConfirmId(null)}
              >
                Batal
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApresiasiPage;
