import { useState, useEffect, useRef } from 'react';
import { fetchPrograms, createProgram, updateProgram, deleteProgram } from '../../services/api';

const INITIAL_FORM = {
  title: '',
  category: 'Ekonomi Kreatif',
  customCategory: '',
  description: '',
  icon: 'fa-briefcase',
  target: 'Seluruh Pemuda Rawa Arum',
  status: 'Berjalan'
};

const ICON_OPTIONS = [
  { label: 'Tas / Koper (Kerja & Bisnis)', value: 'fa-briefcase' },
  { label: 'Bohlam (Ide & Inovasi)', value: 'fa-lightbulb' },
  { label: 'Piala (Olahraga & Prestasi)', value: 'fa-trophy' },
  { label: 'Tangan Berdoa (Keagamaan)', value: 'fa-hands-praying' },
  { label: 'Pohon (Lingkungan Hidup)', value: 'fa-tree' },
  { label: 'Timbangan (Hukum & Keadilan)', value: 'fa-scale-balanced' },
  { label: 'Hati / Kasih Sayang (Sosial & Kemanusiaan)', value: 'fa-heart' },
  { label: 'Toga (Pendidikan & Pelatihan)', value: 'fa-graduation-cap' }
];

const STANDARD_CATEGORIES = [
  'Ekonomi Kreatif',
  'Olahraga & Seni',
  'Keagamaan',
  'Sosial & Lingkungan',
  'Advokasi & HAM'
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

const AdminProgramPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('alphabetical');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchPrograms();
      setList(data);
    } catch (err) {
      setError('Gagal mengambil data program kerja.');
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
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    const isStandard = STANDARD_CATEGORIES.includes(item.category);
    setForm({
      title: item.title,
      category: isStandard ? item.category : 'kustom',
      customCategory: isStandard ? '' : item.category,
      description: item.description,
      icon: item.icon || 'fa-briefcase',
      target: item.target || 'Seluruh Pemuda Rawa Arum',
      status: item.status || 'Berjalan',
    });
    setActiveId(item._id);
    setModalMode('edit');
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const finalCategory = form.category === 'kustom' ? form.customCategory.trim() : form.category;
    if (!finalCategory) {
      setFormError('Kategori pilar wajib diisi.');
      return;
    }

    setSubmitting(true);

    const payload = {
      title: form.title,
      category: finalCategory,
      description: form.description,
      icon: form.icon,
      target: form.target,
      status: form.status,
    };

    try {
      if (modalMode === 'create') {
        await createProgram(payload);
      } else {
        await updateProgram(activeId, payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan program kerja.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteProgram(id);
      setDeleteConfirmId(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Gagal menghapus program kerja.');
    } finally {
      setDeleting(false);
    }
  };

  // Get dynamic unique categories from program list
  const categories = ['all', ...new Set(list.map(item => item.category))];

  const filteredList = list
    .filter((item) => {
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.target && item.target.toLowerCase().includes(query));
      return matchesCategory && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
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
        <p>Memuat program kerja...</p>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Manajemen Program Kerja</h1>
          <p className="admin-page-subtitle">Kelola pilar dan daftar program kerja resmi Karang Taruna Kelurahan Rawa Arum.</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={handleOpenCreate}>
          <i className="fa-solid fa-plus" /> Tambah Program Kerja
        </button>
      </div>

      {error && (
        <div className="admin-alert admin-alert--error" style={{ marginBottom: '1.5rem' }}>
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {/* Program Table */}
      <div className="admin-card">
        <div className="admin-card__header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #edf2f7' }}>
          <div className="admin-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`admin-tab-btn ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat === 'all' ? 'Semua Pilar' : cat}
              </button>
            ))}
          </div>
          <div className="admin-text-muted" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
            Menampilkan {filteredList.length} dari {list.length} program
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
              placeholder="Cari judul, rincian, atau pilar program..."
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

          {/* Status & Sort Selectors */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                <i className="fa-solid fa-circle-info" /> Status:
              </span>
              <select
                className="admin-form-control"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: '120px', height: '40px', padding: '0 0.5rem', fontSize: '0.85rem' }}
              >
                <option value="all">Semua</option>
                <option value="Rencana">Rencana</option>
                <option value="Berjalan">Berjalan</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                <i className="fa-solid fa-arrow-down-wide-short" /> Urutan:
              </span>
              <select
                className="admin-form-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: '150px', height: '40px', padding: '0 0.5rem', fontSize: '0.85rem' }}
              >
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
                    <th>Simbol</th>
                    <th>Judul Program</th>
                    <th>Kategori Pilar</th>
                    <th>Sasaran Target</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((item) => (
                    <tr key={item._id}>
                      <td style={{ width: '60px', textAlign: 'center' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(249, 115, 22, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                          <i className={`fa-solid ${item.icon || 'fa-briefcase'}`} />
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{item.title}</strong>
                        <div className="admin-text-muted" style={{ fontSize: '0.8rem', maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} dangerouslySetInnerHTML={{ __html: item.description }}>
                        </div>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge--accent-light">
                          {item.category}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{item.target}</td>
                      <td>
                        <span className={`admin-badge admin-badge--${
                          item.status === 'Selesai' ? 'success' :
                          item.status === 'Berjalan' ? 'primary' :
                          'warning'
                        }`}>
                          {item.status}
                        </span>
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
                  {searchQuery ? 'Tidak ada hasil pencarian yang cocok' : 'Belum ada program kerja'}
                </p>
                <p className="admin-text-muted" style={{ fontSize: '0.9rem', marginBottom: searchQuery ? '1rem' : '0' }}>
                  {searchQuery 
                    ? `Tidak ada program kerja yang cocok dengan kata kunci "${searchQuery}"` 
                    : 'Silakan klik "Tambah Program Kerja" untuk mendaftarkan pilar baru.'}
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
                {modalMode === 'create' ? 'Tambah Program Kerja Baru' : 'Edit Program Kerja'}
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
                <label className="admin-form-label">Judul Program Kerja</label>
                <input
                  type="text"
                  className="admin-form-control"
                  required
                  placeholder="Contoh: Pelatihan Kewirausahaan Pemuda"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-form-label">Kategori Pilar</label>
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
                  <label className="admin-form-label">Simbol / Ikon Program</label>
                  <select
                    className="admin-form-control"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Category Input Field */}
              {form.category === 'kustom' && (
                <div className="admin-form-group">
                  <label className="admin-form-label">Nama Kategori Pilar Baru</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    required
                    placeholder="Contoh: Kesehatan / Keagamaan / Pendidikan"
                    value={form.customCategory}
                    onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
                  />
                </div>
              )}

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-form-label">Target / Sasaran Peserta</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="Contoh: Pemuda Pelaku Usaha"
                    value={form.target}
                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Status Program</label>
                  <select
                    className="admin-form-control"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Rencana">Rencana</option>
                    <option value="Berjalan">Berjalan</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Deskripsi Rinci Program (Toolbar Format Interaktif)</label>
                <RichTextEditor
                  value={form.description}
                  onChange={(val) => setForm({ ...form, description: val })}
                  placeholder="Jelaskan tujuan, ruang lingkup, serta manfaat program ini..."
                />
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
                    'Simpan Program'
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
              <p>Apakah Anda yakin ingin menghapus program kerja ini?</p>
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

export default AdminProgramPage;
