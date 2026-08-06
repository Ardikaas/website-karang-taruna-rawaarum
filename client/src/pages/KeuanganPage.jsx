import { useState, useEffect, useMemo } from 'react';
import { fetchFinanceTransactions, fetchFinanceSummary } from '../services/api';
import { structureData } from '../constants/structureData';

const ITEMS_PER_PAGE = 10;

const CATEGORIES = [
  'Semua Kategori',
  'Kas Rutin',
  'Donasi & Sponsor',
  'Dana Kelurahan',
  'Kegiatan & Event',
  'Operasional & Peralatan',
  'Bantuan Sosial',
  'Lainnya',
];

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
            <div class="title">${title || 'Bukti Nota Transaksi Kas'}</div>
          </body>
        </html>
      `);
      win.document.close();
    }
  } else {
    window.open(proofUrl, '_blank', 'noopener,noreferrer');
  }
};

const KeuanganPage = () => {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProof, setSelectedProof] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Dynamic Leaders from Structure Data
  const ketuaName =
    structureData?.harian?.find((h) => h.role === 'Ketua')?.name ||
    'Rifki Amrullah';
  const bendaharaName =
    structureData?.harian?.find((h) => h.role === 'Bendahara')?.name ||
    'Febri Kurniawan, S.E';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [transData, summaryData] = await Promise.all([
          fetchFinanceTransactions(),
          fetchFinanceSummary(),
        ]);
        setItems(transData || []);
        if (summaryData) setSummary(summaryData);
      } catch (_err) {
        // Fallback or silent error handling
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Auto-open proof modal if proofId query parameter is present (Direct link from print/prod)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const proofId = params.get('proofId');
    if (proofId && items.length > 0) {
      const match = items.find((i) => i._id === proofId);
      if (match) setSelectedProof(match);
    }
  }, [items]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, categoryFilter, searchTerm]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchType = filterType === 'all' || item.type === filterType;
      const matchCategory =
        categoryFilter === 'Semua Kategori' || item.category === categoryFilter;
      const matchSearch =
        !searchTerm ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchType && matchCategory && matchSearch;
    });
  }, [items, filterType, categoryFilter, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="keuangan-page">
      <div className="container">
        {/* Kop Surat Header Cetak Laporan (Khusus Media Print) */}
        <div className="print-only-kop">
          <div className="print-kop-header">
            <div className="print-kop-left">
              <img
                src="/assets/karang-taruna-seeklogo.png"
                alt="Logo Karang Taruna Rawa Arum"
                className="print-kop-logo"
              />
              <div className="print-kop-text">
                <h2>KARANG TARUNA RAWA ARUM</h2>
                <p>
                  Kelurahan Rawa Arum, Kec. Grogol, Kota Cilegon, Banten 42436
                </p>
              </div>
            </div>
            <div className="print-kop-right">
              <div>Laporan Kas Pemuda</div>
            </div>
          </div>
          <h1 className="print-report-title">
            Laporan Transparansi Keuangan Kas
          </h1>
          <p className="print-report-meta">
            Tanggal Cetak: {formatDate(new Date().toISOString())} | Sumber:
            Portal Resmi Karang Taruna Rawa Arum
          </p>
        </div>

        {/* Header Seksi (Standard Website SOP) */}
        <div className="subpage-header">
          <div className="section-header" data-watermark="TRANSPARANSI">
            <span className="section-tag">Akuntabilitas Warga</span>
            <h1 className="section-title">
              Laporan Keuangan Kas Karang Taruna
            </h1>
            <div className="title-underline"></div>
          </div>
          <p className="subpage-intro">
            Seluruh rincian uang masuk, pengeluaran operasional, donasi, serta
            bantuan hibah Kelurahan Rawa Arum dicatat secara terbuka dan dapat
            diaudit warga lengkap dengan lampiran bukti nota.
          </p>
        </div>

        {/* Printable Summary Block (Khusus Cetak) */}
        <div className="print-only-summary">
          <div className="print-summary-item">
            <span>Total Pemasukan:</span>
            <strong>{formatRupiah(summary.totalIncome)}</strong>
          </div>
          <div className="print-summary-item">
            <span>Total Pengeluaran:</span>
            <strong>{formatRupiah(summary.totalExpense)}</strong>
          </div>
          <div className="print-summary-item">
            <span>Saldo Kas Akhir:</span>
            <strong>{formatRupiah(summary.balance)}</strong>
          </div>
          <div className="print-summary-item">
            <span>Jumlah Transaksi:</span>
            <strong>{summary.totalCount} Catatan</strong>
          </div>
        </div>

        {/* Ringkasan Metric Kas (Tampilan Web) */}
        <div className="keuangan-stats-grid">
          <div className="keuangan-stat-card keuangan-stat-card--featured">
            <div className="keuangan-stat-header">
              <span className="keuangan-stat-label">Saldo Kas Saat Ini</span>
              <span className="keuangan-stat-badge">Kas Terverifikasi</span>
            </div>
            <div className="keuangan-stat-value keuangan-stat-value--balance">
              {loading ? '...' : formatRupiah(summary.balance)}
            </div>
            <p className="keuangan-stat-desc">
              Sisa saldo kas bersih siap guna untuk operasional & kegiatan
              masyarakat.
            </p>
          </div>

          <div className="keuangan-stat-card">
            <div className="keuangan-stat-header">
              <span className="keuangan-stat-label">Total Pemasukan</span>
              <div className="keuangan-stat-icon keuangan-stat-icon--income">
                <i className="fa-solid fa-arrow-down"></i>
              </div>
            </div>
            <div className="keuangan-stat-value keuangan-stat-value--income">
              {loading ? '...' : formatRupiah(summary.totalIncome)}
            </div>
            <p className="keuangan-stat-desc">
              Akumulasi iuran, sponsor, dan hibah kelurahan.
            </p>
          </div>

          <div className="keuangan-stat-card">
            <div className="keuangan-stat-header">
              <span className="keuangan-stat-label">Total Pengeluaran</span>
              <div className="keuangan-stat-icon keuangan-stat-icon--expense">
                <i className="fa-solid fa-arrow-up"></i>
              </div>
            </div>
            <div className="keuangan-stat-value keuangan-stat-value--expense">
              {loading ? '...' : formatRupiah(summary.totalExpense)}
            </div>
            <p className="keuangan-stat-desc">
              Pengadaan peralatan, event, dan bantuan sosial.
            </p>
          </div>

          <div className="keuangan-stat-card">
            <div className="keuangan-stat-header">
              <span className="keuangan-stat-label">Jumlah Pencatatan</span>
              <div className="keuangan-stat-icon keuangan-stat-icon--count">
                <i className="fa-solid fa-receipt"></i>
              </div>
            </div>
            <div
              className="keuangan-stat-value"
              style={{ color: 'var(--primary-mid)' }}
            >
              {loading ? '...' : `${summary.totalCount} Transaksi`}
            </div>
            <p className="keuangan-stat-desc">
              Pencatatan kas terlampir kwitansi resmi.
            </p>
          </div>
        </div>

        {/* Informasi Edukasi Warga */}
        <div className="keuangan-info-banner">
          <div className="keuangan-info-icon">
            <i className="fa-solid fa-circle-info"></i>
          </div>
          <div className="keuangan-info-text">
            <h4>Prinsip Akuntabilitas Publik Karang Taruna Rawa Arum</h4>
            <p>
              Setiap uang masuk dan pengeluaran kas dicatat secara transparan.
              Warga dapat mengklik tombol{' '}
              <strong>&quot;Lihat Bukti&quot;</strong> pada tabel untuk
              memeriksa nota pembayaran dan kwitansi fisik.
            </p>
          </div>
        </div>

        {/* Control Bar (Filter & Search) */}
        <div className="keuangan-controls-bar">
          <div className="keuangan-tab-group">
            <button
              type="button"
              className={`keuangan-tab-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Semua Transaksi
            </button>
            <button
              type="button"
              className={`keuangan-tab-btn ${filterType === 'pemasukan' ? 'active-income' : ''}`}
              onClick={() => setFilterType('pemasukan')}
            >
              Pemasukan Kas
            </button>
            <button
              type="button"
              className={`keuangan-tab-btn ${filterType === 'pengeluaran' ? 'active-expense' : ''}`}
              onClick={() => setFilterType('pengeluaran')}
            >
              Pengeluaran Kas
            </button>
          </div>

          <div className="keuangan-filter-actions">
            <select
              className="keuangan-category-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

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

            <button
              type="button"
              className="btn btn-outline keuangan-print-btn"
              onClick={handlePrint}
              title="Cetak Laporan Keuangan"
            >
              <i className="fa-solid fa-print"></i>
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>

        {/* Tabel Data Kas Transparan */}
        {loading ? (
          <div className="keuangan-loading">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>Memuat data transaksi kas...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="keuangan-empty">
            <i className="fa-solid fa-folder-open"></i>
            <p>Tidak ada data transaksi kas yang sesuai filter.</p>
          </div>
        ) : (
          <div className="keuangan-table-card">
            <div className="table-responsive">
              <table className="keuangan-table">
                <thead>
                  <tr>
                    <th style={{ width: '120px' }}>Tanggal</th>
                    <th>Judul & Rincian Transaksi</th>
                    <th style={{ width: '160px' }}>Kategori</th>
                    <th style={{ width: '160px', textAlign: 'right' }}>
                      Nominal (Rp)
                    </th>
                    <th style={{ width: '170px', textAlign: 'center' }}>
                      Bukti Nota
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item) => {
                    const isIncome = item.type === 'pemasukan';
                    const publicLink = item.proofUrl
                      ? item.proofUrl.startsWith('data:')
                        ? `${window.location.origin}/keuangan?proofId=${item._id}`
                        : item.proofUrl
                      : null;

                    return (
                      <tr key={item._id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span className="keuangan-date">
                            {formatDate(item.date)}
                          </span>
                        </td>
                        <td>
                          <div className="keuangan-title-cell">
                            <span className="keuangan-item-title">
                              {item.title}
                            </span>
                            {item.description && (
                              <p className="keuangan-item-desc">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="keuangan-category-tag">
                            {item.category}
                          </span>
                        </td>
                        <td
                          style={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                        >
                          <span
                            className={
                              isIncome
                                ? 'keuangan-amount-income'
                                : 'keuangan-amount-expense'
                            }
                          >
                            {isIncome ? '+ ' : '- '}
                            {formatRupiah(item.amount)}
                          </span>
                        </td>
                        <td
                          style={{ textAlign: 'center', whiteSpace: 'nowrap' }}
                        >
                          {item.proofUrl ? (
                            <>
                              {/* Onscreen Interactive Button */}
                              <button
                                type="button"
                                className="keuangan-proof-btn screen-only-btn"
                                onClick={() => setSelectedProof(item)}
                              >
                                <i className="fa-solid fa-file-invoice"></i>{' '}
                                Lihat Bukti
                              </button>
                              {/* PDF/Print Clickable Public Link */}
                              <a
                                href={publicLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="print-proof-link"
                              >
                                Buka Bukti Nota
                              </a>
                            </>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                              }}
                            >
                              Tanpa Lampiran
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Client-Side Pagination Control Bar (Max 10 per page) */}
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

        {/* Printable Signatures Block / Lembar Pengesahan (Khusus Cetak) */}
        <div className="print-only-signatures">
          <div className="print-sig-col">
            <p className="print-sig-label">
              Mengetahui,
              <br />
              <strong>Ketua Karang Taruna</strong>
            </p>
            <p className="print-sig-name">{ketuaName}</p>
          </div>

          <div className="print-sig-col">
            <p className="print-sig-label">
              Dibuat Oleh,
              <br />
              <strong>Bendahara Umum</strong>
            </p>
            <p className="print-sig-name">{bendaharaName}</p>
          </div>

          <div className="print-sig-col">
            <p className="print-sig-label">
              Menyetujui,
              <br />
              <strong>Lurah Rawa Arum</strong>
            </p>
            <p className="print-sig-name">H. Sulaeman, S.IP</p>
          </div>
        </div>
      </div>

      {/* Modal Popup Preview Bukti Nota (Clean Centered BEM Overlay) */}
      {selectedProof && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedProof(null)}
        >
          <div
            className="admin-modal"
            style={{ maxWidth: '600px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color:
                      selectedProof.type === 'pemasukan'
                        ? 'var(--success)'
                        : 'var(--danger)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Bukti Transaksi{' '}
                  {selectedProof.type === 'pemasukan'
                    ? 'Pemasukan'
                    : 'Pengeluaran'}
                </span>
                <h3
                  className="admin-modal__title"
                  style={{ marginTop: '0.2rem' }}
                >
                  {selectedProof.title}
                </h3>
              </div>
              <button
                type="button"
                className="admin-modal__close"
                onClick={() => setSelectedProof(null)}
                aria-label="Tutup Popup"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="admin-modal__body">
              {/* Meta Grid */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '0.75rem',
                  fontSize: '0.85rem',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <span
                    style={{
                      color: 'var(--text-muted)',
                      display: 'block',
                      fontSize: '0.75rem',
                    }}
                  >
                    Nominal
                  </span>
                  <strong
                    style={{
                      fontSize: '1.05rem',
                      color:
                        selectedProof.type === 'pemasukan'
                          ? 'var(--success)'
                          : 'var(--danger)',
                    }}
                  >
                    {formatRupiah(selectedProof.amount)}
                  </strong>
                </div>
                <div>
                  <span
                    style={{
                      color: 'var(--text-muted)',
                      display: 'block',
                      fontSize: '0.75rem',
                    }}
                  >
                    Tanggal
                  </span>
                  <strong>{formatDate(selectedProof.date)}</strong>
                </div>
                <div>
                  <span
                    style={{
                      color: 'var(--text-muted)',
                      display: 'block',
                      fontSize: '0.75rem',
                    }}
                  >
                    Kategori
                  </span>
                  <strong>{selectedProof.category}</strong>
                </div>
              </div>

              {/* Rincian Catatan (Styled for Long Text) */}
              {selectedProof.description && (
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    marginBottom: '1rem',
                    border: '1px solid #e2e8f0',
                    maxHeight: '110px',
                    overflowY: 'auto',
                  }}
                >
                  <span
                    style={{
                      color: 'var(--text-muted)',
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      marginBottom: '0.25rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    Keterangan Rincian / Catatan:
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-line',
                      wordBreak: 'break-word',
                    }}
                  >
                    {selectedProof.description}
                  </p>
                </div>
              )}

              {/* Pratinjau Foto Nota */}
              <div
                style={{
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#0f172a',
                  textAlign: 'center',
                  padding: '0.5rem',
                }}
              >
                <img
                  src={selectedProof.proofUrl}
                  alt={selectedProof.title || 'Bukti Transaksi'}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '360px',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                    borderRadius: '6px',
                  }}
                />
              </div>

              {/* Audit Log Tracking History */}
              {selectedProof.editHistory &&
                selectedProof.editHistory.length > 0 && (
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
                        {selectedProof.editHistory.length})
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
                      {selectedProof.editHistory.map((log, idx) => (
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
                onClick={() => setSelectedProof(null)}
              >
                Tutup
              </button>

              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={() =>
                  handleOpenFullProof(
                    selectedProof.proofUrl,
                    selectedProof.title
                  )
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

export default KeuanganPage;
