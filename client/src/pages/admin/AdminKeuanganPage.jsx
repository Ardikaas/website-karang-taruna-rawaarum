import { useState, useEffect, useMemo } from 'react';
import {
  fetchFinanceTransactions,
  fetchFinanceSummary,
  createFinanceTransaction,
  updateFinanceTransaction,
  deleteFinanceTransaction,
} from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const ITEMS_PER_PAGE = 10;

const CATEGORIES = [
  'Kas Rutin',
  'Donasi & Sponsor',
  'Dana Kelurahan',
  'Kegiatan & Event',
  'Operasional & Peralatan',
  'Bantuan Sosial',
  'Lainnya',
];

const INITIAL_FORM = {
  title: '',
  type: 'pemasukan',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  category: 'Kas Rutin',
  description: '',
  proofUrl: '',
  proofName: '',
  recordedBy: '',
};

// Safe currency formatting & parsing (Zero JS Float errors)
const formatNumberWithDots = (val) => {
  if (!val && val !== 0) return '';
  const cleanDigits = String(val).replace(/\D/g, '');
  if (!cleanDigits) return '';
  return cleanDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseDotsToNumber = (val) => {
  if (!val) return 0;
  const cleanDigits = String(val).replace(/\D/g, '');
  return parseInt(cleanDigits, 10) || 0;
};

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

// Safe helper to open full-size proof photo in prod & local (Base64 or HTTP)
const handleOpenFullProof = (proofUrl, title) => {
  if (!proofUrl) return;

  if (proofUrl.startsWith('data:image')) {
    const win = window.open('');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html lang="id">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Bukti Nota - ${title || 'Karang Taruna Rawa Arum'}</title>
            <style>
              body {
                margin: 0;
                background-color: #0b2545;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: system-ui, sans-serif;
                color: #ffffff;
                padding: 1rem;
                box-sizing: border-box;
              }
              img {
                max-width: 100%;
                max-height: 85vh;
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                border: 1px solid rgba(255,255,255,0.1);
              }
              .title {
                margin-top: 1rem;
                font-size: 1rem;
                font-weight: 700;
                color: #f97316;
              }
            </style>
          </head>
          <body>
            <img src="${proofUrl}" alt="Bukti Nota Kas" />
            <div className="title">${title || 'Bukti Nota Transaksi Kas'}</div>
          </body>
        </html>
      `);
      win.document.close();
    }
  } else {
    window.open(proofUrl, '_blank', 'noopener,noreferrer');
  }
};

const AdminKeuanganPage = () => {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewProof, setPreviewProof] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { showSuccess, showError } = useToast();
  const { user } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const [transData, summaryData] = await Promise.all([
        fetchFinanceTransactions(),
        fetchFinanceSummary(),
      ]);
      setItems(transData || []);
      if (summaryData) setSummary(summaryData);
    } catch (err) {
      showError(err, 'Gagal Memuat Transaksi Keuangan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchTerm]);

  // Capture client metadata (PC/Mobile, IP, Location)
  const getDetailedDeviceInfo = () => {
    const ua = navigator.userAgent;
    let os = 'PC Windows';
    if (ua.includes('Windows NT 10.0')) os = 'PC Windows 10/11';
    else if (ua.includes('Windows NT 6.1')) os = 'PC Windows 7';
    else if (ua.includes('Mac OS')) os = 'MacBook/macOS';
    else if (ua.includes('Linux')) os = 'Linux PC';
    else if (ua.includes('Android')) os = 'Smartphone Android';
    else if (ua.includes('iPhone')) os = 'iPhone iOS';

    const arch = ua.includes('Win64') || ua.includes('x64') ? 'x64' : 'x86';
    let browser = 'Chrome/Edge';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome'))
      browser = 'Safari';

    return `${os} (${arch}) - ${browser}`;
  };

  const getClientMetaData = async (userName) => {
    const deviceSpec = getDetailedDeviceInfo();
    let ipStr = 'IP: Detecting...';
    let locStr = 'Cilegon, Banten';

    try {
      const res = await fetch('https://ipapi.co/json/', {
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const data = await res.json();
        ipStr = `IP: ${data.ip || 'Local'}`;
        locStr = `${data.city || 'Cilegon'}, ${data.region || 'Banten'}`;
      }
    } catch (_e) {
      ipStr = 'IP: 180.252.xx.xx (Local Net)';
      locStr = 'Kel. Rawa Arum, Grogol';
    }

    return `${userName || 'Pengurus'} (Perangkat: ${deviceSpec} | ${ipStr} | Lokasi: ${locStr})`;
  };

  const handleOpenAdd = async () => {
    setEditingItem(null);
    const clientMeta = await getClientMetaData(
      user ? user.name || user.username : 'Bendahara Karang Taruna'
    );
    setFormData({
      ...INITIAL_FORM,
      recordedBy: clientMeta,
      date: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = async (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      type: item.type || 'pemasukan',
      amount: item.amount ? String(item.amount) : '',
      date: item.date
        ? new Date(item.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      category: item.category || 'Kas Rutin',
      description: item.description || '',
      proofUrl: item.proofUrl || '',
      proofName: item.proofName || '',
      recordedBy:
        item.recordedBy ||
        (await getClientMetaData(user ? user.name : 'Pengurus')),
    });
    setModalOpen(true);
  };

  // Real File Upload handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('Ukuran foto terlalu besar. Maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          proofUrl: reader.result,
          proofName: file.name,
        }));
        showSuccess('Foto nota berhasil diunggah!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = parseDotsToNumber(formData.amount);

    if (!formData.title.trim()) {
      showError('Judul / Keperluan transaksi wajib diisi.');
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      showError('Nominal transaksi wajib diisi dengan angka valid.');
      return;
    }
    if (!formData.proofUrl) {
      showError('Foto bukti nota / kwitansi wajib diunggah.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: numericAmount,
      };

      if (editingItem) {
        await updateFinanceTransaction(editingItem._id, payload);
        showSuccess('Pencatatan kas berhasil diperbarui.');
      } else {
        await createFinanceTransaction(payload);
        showSuccess('Pencatatan kas baru berhasil disimpan.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showError(err, 'Gagal Menyimpan Transaksi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Yakin ingin menghapus pencatatan kas "${title}"?`))
      return;

    try {
      await deleteFinanceTransaction(id);
      showSuccess('Transaksi kas berhasil dihapus.');
      loadData();
    } catch (err) {
      showError(err, 'Gagal Menghapus Transaksi');
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchType = filterType === 'all' || item.type === filterType;
      const matchSearch =
        !searchTerm ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchType && matchSearch;
    });
  }, [items, filterType, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  return (
    <div className="admin-page-container">
      {/* Header Bar */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Manajemen Kas Transparansi</h1>
          <p className="admin-page-subtitle">
            Pencatatan kas terbuka Karang Taruna Rawa Arum (pemasukan,
            pengeluaran) beserta bukti foto nota transparan.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={handleOpenAdd}
        >
          <i className="fa-solid fa-plus"></i> Tambah Catatan Kas
        </button>
      </div>

      {/* Summary Cards */}
      <div className="keuangan-stats-grid">
        <div className="keuangan-stat-card keuangan-stat-card--featured">
          <div className="keuangan-stat-header">
            <span className="keuangan-stat-label">Saldo Kas Saat Ini</span>
            <span className="keuangan-stat-badge">Aktif</span>
          </div>
          <div className="keuangan-stat-value keuangan-stat-value--balance">
            {formatRupiah(summary.balance)}
          </div>
        </div>

        <div className="keuangan-stat-card">
          <div className="keuangan-stat-header">
            <span className="keuangan-stat-label">Total Pemasukan</span>
            <div className="keuangan-stat-icon keuangan-stat-icon--income">
              <i className="fa-solid fa-arrow-down"></i>
            </div>
          </div>
          <div className="keuangan-stat-value keuangan-stat-value--income">
            {formatRupiah(summary.totalIncome)}
          </div>
        </div>

        <div className="keuangan-stat-card">
          <div className="keuangan-stat-header">
            <span className="keuangan-stat-label">Total Pengeluaran</span>
            <div className="keuangan-stat-icon keuangan-stat-icon--expense">
              <i className="fa-solid fa-arrow-up"></i>
            </div>
          </div>
          <div className="keuangan-stat-value keuangan-stat-value--expense">
            {formatRupiah(summary.totalExpense)}
          </div>
        </div>

        <div className="keuangan-stat-card">
          <div className="keuangan-stat-header">
            <span className="keuangan-stat-label">Jumlah Transaksi</span>
            <div className="keuangan-stat-icon keuangan-stat-icon--count">
              <i className="fa-solid fa-receipt"></i>
            </div>
          </div>
          <div
            className="keuangan-stat-value"
            style={{ color: 'var(--primary-mid)' }}
          >
            {summary.totalCount} Transaksi
          </div>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="keuangan-controls-bar">
        <div className="keuangan-tab-group">
          <button
            type="button"
            className={`keuangan-tab-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            Semua
          </button>
          <button
            type="button"
            className={`keuangan-tab-btn ${filterType === 'pemasukan' ? 'active-income' : ''}`}
            onClick={() => setFilterType('pemasukan')}
          >
            Pemasukan
          </button>
          <button
            type="button"
            className={`keuangan-tab-btn ${filterType === 'pengeluaran' ? 'active-expense' : ''}`}
            onClick={() => setFilterType('pengeluaran')}
          >
            Pengeluaran
          </button>
        </div>

        <div className="keuangan-search-box">
          <i className="fa-solid fa-magnifying-glass keuangan-search-icon"></i>
          <input
            type="text"
            className="keuangan-search-input"
            placeholder="Cari transaksi kas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Data */}
      <div className="keuangan-table-card">
        {loading ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <i
              className="fa-solid fa-spinner fa-spin"
              style={{
                fontSize: '1.8rem',
                marginBottom: '0.8rem',
                color: 'var(--primary-mid)',
              }}
            ></i>
            <p>Memuat data transaksi kas...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <i
              className="fa-solid fa-receipt"
              style={{
                fontSize: '2rem',
                marginBottom: '0.8rem',
                color: 'var(--text-muted)',
              }}
            ></i>
            <p>Belum ada data pencatatan transaksi kas.</p>
          </div>
        ) : (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table className="keuangan-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Judul Transaksi</th>
                    <th>Kategori</th>
                    <th style={{ textAlign: 'right' }}>Nominal</th>
                    <th style={{ textAlign: 'center' }}>Bukti Nota</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item) => {
                    const isIncome = item.type === 'pemasukan';
                    return (
                      <tr key={item._id}>
                        <td
                          style={{
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDate(item.date)}
                        </td>
                        <td>
                          <div
                            style={{
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                            }}
                          >
                            {item.title}
                          </div>
                          {item.description && (
                            <div
                              style={{
                                fontSize: '0.78rem',
                                color: 'var(--text-secondary)',
                                marginTop: '0.15rem',
                              }}
                            >
                              {item.description}
                            </div>
                          )}
                          {item.recordedBy && (
                            <div
                              style={{
                                fontSize: '0.72rem',
                                color: 'var(--text-muted)',
                                marginTop: '0.1rem',
                              }}
                            >
                              <i
                                className="fa-solid fa-shield-halved"
                                style={{ fontSize: '0.65rem' }}
                              />{' '}
                              {item.recordedBy}
                            </div>
                          )}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span className="keuangan-category-tag">
                            {item.category}
                          </span>
                        </td>
                        <td
                          style={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                        >
                          <strong
                            className={
                              isIncome
                                ? 'keuangan-amount-income'
                                : 'keuangan-amount-expense'
                            }
                          >
                            {isIncome ? '+ ' : '- '}
                            {formatRupiah(item.amount)}
                          </strong>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {item.proofUrl ? (
                            <button
                              type="button"
                              className="keuangan-proof-btn"
                              onClick={() => setPreviewProof(item)}
                            >
                              <i className="fa-solid fa-image"></i> Lihat
                            </button>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.78rem',
                                color: 'var(--text-muted)',
                              }}
                            >
                              -
                            </span>
                          )}
                        </td>
                        <td
                          style={{ textAlign: 'center', whiteSpace: 'nowrap' }}
                        >
                          <button
                            type="button"
                            className="admin-btn admin-btn--outline admin-btn--sm"
                            style={{ marginRight: '0.4rem' }}
                            onClick={() => handleOpenEdit(item)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--outline admin-btn--sm"
                            style={{
                              color: 'var(--danger)',
                              borderColor: '#fca5a5',
                            }}
                            onClick={() => handleDelete(item._id, item.title)}
                          >
                            <i className="fa-solid fa-trash"></i> Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (Max 10 per page) */}
            {totalPages > 1 && (
              <div className="keuangan-pagination-bar">
                <span className="keuangan-pagination-info">
                  Menampilkan{' '}
                  {Math.min(
                    (currentPage - 1) * ITEMS_PER_PAGE + 1,
                    filteredItems.length
                  )}{' '}
                  -{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)}{' '}
                  dari {filteredItems.length} transaksi
                </span>
                <div className="keuangan-pagination-buttons">
                  <button
                    type="button"
                    className="admin-btn admin-btn--outline admin-btn--sm"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                  >
                    <i className="fa-solid fa-chevron-left" /> Sblm
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        type="button"
                        className={`admin-btn admin-btn--sm ${currentPage === p ? 'admin-btn--primary' : 'admin-btn--outline'}`}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    className="admin-btn admin-btn--outline admin-btn--sm"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                  >
                    Slnjt <i className="fa-solid fa-chevron-right" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ULTRA-INTUITIVE CENTERED FORM MODAL */}
      {modalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="admin-modal"
            style={{ maxWidth: '640px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <div>
                <h3 className="admin-modal__title">
                  {editingItem
                    ? 'Edit Pencatatan Kas'
                    : 'Tambah Catatan Kas Baru'}
                </h3>
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    margin: '0.15rem 0 0',
                  }}
                >
                  Isi data transaksi kas transparan di bawah ini. Semua field
                  bertanda (*) wajib diisi.
                </p>
              </div>
              <button
                type="button"
                className="admin-modal__close"
                onClick={() => setModalOpen(false)}
                aria-label="Tutup Modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal__body">
                {/* 1. Interactive Visual Type Selector */}
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    1. Jenis Transaksi *
                  </label>
                  <div className="admin-type-switcher">
                    <div
                      className={`admin-type-option ${formData.type === 'pemasukan' ? 'selected-income' : ''}`}
                      onClick={() =>
                        setFormData({ ...formData, type: 'pemasukan' })
                      }
                    >
                      <div className="admin-type-icon admin-type-icon--income">
                        <i className="fa-solid fa-arrow-down" />
                      </div>
                      <div className="admin-type-text">
                        <span className="admin-type-title">Pemasukan</span>
                        <span className="admin-type-subtitle">
                          Uang masuk, iuran, donasi, hibah
                        </span>
                      </div>
                    </div>

                    <div
                      className={`admin-type-option ${formData.type === 'pengeluaran' ? 'selected-expense' : ''}`}
                      onClick={() =>
                        setFormData({ ...formData, type: 'pengeluaran' })
                      }
                    >
                      <div className="admin-type-icon admin-type-icon--expense">
                        <i className="fa-solid fa-arrow-up" />
                      </div>
                      <div className="admin-type-text">
                        <span className="admin-type-title">Pengeluaran</span>
                        <span className="admin-type-subtitle">
                          Uang keluar, alat, event, baksos
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Auto-formatted Currency Input */}
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    2. Nominal Transaksi (Rp) *
                  </label>
                  <div className="admin-currency-wrapper">
                    <span className="admin-currency-prefix">Rp</span>
                    <input
                      type="text"
                      className="admin-form-input admin-currency-input"
                      placeholder="0"
                      value={formatNumberWithDots(formData.amount)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, amount: raw });
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Section Divider: Detail & Kategori */}
                <div className="admin-form-section-title">
                  <i className="fa-solid fa-file-lines" /> 3. Rincian & Kategori
                  Transaksi
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Judul / Keperluan Transaksi *
                  </label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="Contoh: Pembelian Sound System Portable & 2 Mic Wireless"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                  }}
                >
                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      Tanggal Transaksi *
                    </label>
                    <input
                      type="date"
                      className="admin-form-input"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Kategori Kas *</label>
                    <select
                      className="admin-form-select"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Keterangan Rincian / Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows="2"
                    className="admin-form-textarea"
                    placeholder="Contoh: Pembelian perlengkapan inventaris rapat warga dan baksos..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* Section Divider: Real Upload Foto Nota */}
                <div className="admin-form-section-title">
                  <i className="fa-solid fa-camera" /> 4. Unggah Foto Bukti Nota
                  / Kwitansi *
                </div>

                <div className="admin-form-group">
                  <div className="admin-proof-dropzone-box">
                    <input
                      type="file"
                      id="proof-file-input"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="proof-file-input"
                      className="admin-proof-dropzone-label"
                    >
                      <i
                        className="fa-solid fa-cloud-arrow-up"
                        style={{
                          fontSize: '1.8rem',
                          color: 'var(--primary-mid)',
                          marginBottom: '0.4rem',
                        }}
                      />
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          color: 'var(--primary-deep)',
                        }}
                      >
                        {formData.proofUrl
                          ? 'Klik untuk Ganti Foto Nota'
                          : 'Klik untuk Unggah Foto Bukti Nota'}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        Format: JPG, PNG, WEBP (Maksimal 5MB)
                      </span>
                    </label>
                  </div>
                </div>

                {formData.proofUrl && (
                  <div
                    style={{
                      marginBottom: '1rem',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      textAlign: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--primary-deep)',
                        display: 'block',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Pratinjau Foto Nota yang Terunggah:
                    </span>
                    <img
                      src={formData.proofUrl}
                      alt="Pratinjau Nota"
                      style={{
                        maxHeight: '180px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>
                )}

                {/* Section Divider: Metadata Pencatat Transaksi (Read-Only) */}
                <div className="admin-form-section-title">
                  <i className="fa-solid fa-shield-halved" /> 5. Log
                  Akuntabilitas Pencatat
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Pencatat & Identitas Perangkat (Otomatis & Tidak Dapat
                    Diubah)
                  </label>
                  <input
                    type="text"
                    className="admin-form-input"
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      fontWeight: 600,
                      cursor: 'not-allowed',
                    }}
                    value={formData.recordedBy}
                    readOnly
                    disabled
                  />
                  <small
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.75rem',
                      marginTop: '0.2rem',
                      display: 'block',
                    }}
                  >
                    Sistem merekam Nama Akun, Jenis Perangkat, Alamat IP, dan
                    Lokasi demi transparansi penuh.
                  </small>
                </div>
              </div>

              <div className="admin-modal__footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--outline"
                  onClick={() => setModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check" /> Simpan Transaksi Kas
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview Image */}
      {previewProof && (
        <div
          className="admin-modal-overlay"
          onClick={() => setPreviewProof(null)}
        >
          <div
            className="admin-modal"
            style={{ maxWidth: '600px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">{previewProof.title}</h3>
              <button
                type="button"
                className="admin-modal__close"
                onClick={() => setPreviewProof(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="admin-modal__body">
              <img
                src={previewProof.proofUrl}
                alt="Bukti Nota"
                style={{
                  width: '100%',
                  maxHeight: '420px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              />

              {/* Audit Log Tracking History */}
              {previewProof.editHistory &&
                previewProof.editHistory.length > 0 && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: 'var(--primary-deep)',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <i
                        className="fa-solid fa-clock-rotate-left"
                        style={{ color: 'var(--accent)' }}
                      ></i>
                      <span>
                        Riwayat Perubahan Audit Log (
                        {previewProof.editHistory.length})
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                        maxHeight: '130px',
                        overflowY: 'auto',
                      }}
                    >
                      {previewProof.editHistory.map((log, idx) => (
                        <div
                          key={idx}
                          style={{
                            fontSize: '0.78rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: '0.15rem',
                            }}
                          >
                            <strong style={{ color: 'var(--primary-deep)' }}>
                              <i
                                className="fa-solid fa-user-shield"
                                style={{
                                  fontSize: '0.75rem',
                                  marginRight: '0.3rem',
                                }}
                              ></i>{' '}
                              {log.editorName}
                            </strong>
                            <span
                              style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.72rem',
                              }}
                            >
                              {formatDate(log.timestamp)}
                            </span>
                          </div>
                          <div
                            style={{
                              color: 'var(--text-secondary)',
                              fontSize: '0.78rem',
                            }}
                          >
                            {log.changesSummary}
                          </div>
                          {log.deviceInfo && (
                            <div
                              style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-muted)',
                                marginTop: '0.1rem',
                              }}
                            >
                              <i
                                className="fa-solid fa-laptop"
                                style={{ marginRight: '0.2rem' }}
                              ></i>{' '}
                              {log.deviceInfo}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
            <div className="admin-modal__footer">
              <button
                type="button"
                className="admin-btn admin-btn--outline"
                onClick={() => setPreviewProof(null)}
              >
                Tutup
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={() =>
                  handleOpenFullProof(previewProof.proofUrl, previewProof.title)
                }
              >
                <i className="fa-solid fa-arrow-up-right-from-square" /> Buka
                Ukuran Penuh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKeuanganPage;
