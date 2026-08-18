import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';

const ERROR_PRESETS = {
  404: {
    code: '404',
    title: 'Halaman Tidak Ditemukan',
    subtitle:
      'Oops! Tautan yang Anda tuju mungkin salah ketik, sudah dipindahkan, atau telah dihapus.',
    icon: 'fa-compass-drafting',
    badgeText: 'Halaman Hilang / Not Found',
    badgeColor: '#f97316',
    suggestions: [
      'Periksa kembali ejaan alamat URL pada bilah browser Anda.',
      'Gunakan fitur pencarian di bawah untuk menemukan topik yang Anda cari.',
      'Kunjungi tautan menu populer yang tersedia.',
    ],
  },
  403: {
    code: '403',
    title: 'Akses Ditolak',
    subtitle:
      'Maaf, Anda tidak memiliki izin atau hak akses untuk membuka halaman portal ini.',
    icon: 'fa-shield-halved',
    badgeText: 'Akses Terbatas / Forbidden',
    badgeColor: '#ef4444',
    suggestions: [
      'Jika Anda adalah pengurus Karang Taruna, silakan masuk melalui halaman Login Pengurus.',
      'Hubungi Super Administrator jika Anda merasa ini adalah sebuah kekeliruan.',
    ],
  },
  500: {
    code: '500',
    title: 'Gangguan Server / Sistem',
    subtitle:
      'Terjadi kendala internal pada server saat memproses permintaan Anda. Tim teknis sedang memperbaikinya.',
    icon: 'fa-server',
    badgeText: 'Kendala Server / Internal Error',
    badgeColor: '#8b5cf6',
    suggestions: [
      'Tunggu beberapa saat dan klik tombol Muat Ulang Halaman di bawah.',
      'Periksa koneksi internet Anda atau hubungi admin jika kendala berlanjut.',
    ],
  },
  400: {
    code: '400',
    title: 'Permintaan Tidak Valid',
    subtitle:
      'Server tidak dapat memproses permintaan Anda karena parameter atau format data yang dikirim tidak sesuai.',
    icon: 'fa-triangle-exclamation',
    badgeText: 'Permintaan Salah / Bad Request',
    badgeColor: '#eab308',
    suggestions: [
      'Pastikan Anda tidak memasukkan karakter khusus berbahaya pada bilah pencarian.',
      'Kembali ke beranda untuk memulai navigasi yang aman.',
    ],
  },
  503: {
    code: '503',
    title: 'Sistem Sedang Pemeliharaan',
    subtitle:
      'Website Karang Taruna sedang dalam proses peningkatan layanan (*Scheduled Maintenance*) untuk kenyamanan Anda.',
    icon: 'fa-screwdriver-wrench',
    badgeText: 'Mode Pemeliharaan / Maintenance',
    badgeColor: '#0ea5e9',
    suggestions: [
      'Layanan akan segera kembali normal dalam beberapa saat.',
      'Untuk kebutuhan mendesak, silakan hubungi pengurus melalui kontak WhatsApp resmi.',
    ],
  },
};

const QUICK_LINKS = [
  {
    title: 'Lowongan Kerja',
    desc: 'Info karir dan peluang kerja untuk pemuda Cilegon & sekitar.',
    path: '/loker',
    icon: 'fa-briefcase',
    color: '#0ea5e9',
  },
  {
    title: 'Potensi UMKM',
    desc: 'Katalog produk & jasa usaha kreatif binaan warga Rawa Arum.',
    path: '/umkm',
    icon: 'fa-store',
    color: '#f97316',
  },
  {
    title: 'Berita & Kegiatan',
    desc: 'Agenda kepemudaan, gotong royong, dan kegiatan sosial.',
    path: '/kegiatan',
    icon: 'fa-newspaper',
    color: '#10b981',
  },
  {
    title: 'Hubungi Pengurus',
    desc: 'Kirim aspirasi, pertanyaan, atau permohonan kemitraan.',
    path: '/kontak',
    icon: 'fa-comments',
    color: '#8b5cf6',
  },
];

const ErrorPage = ({
  code = 404,
  customTitle,
  customMessage,
  errorDetails,
  onReset,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTechDetails, setShowTechDetails] = useState(false);

  // Extract code from prop or URL parameter ?code=500
  const effectiveCode = searchParams.get('code')
    ? parseInt(searchParams.get('code'), 10)
    : code;
  const config = ERROR_PRESETS[effectiveCode] || ERROR_PRESETS[404];

  const pageTitle =
    customTitle || `${config.code} ${config.title} - Karang Taruna Rawa Arum`;
  const pageSubtitle = customMessage || config.subtitle;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/kegiatan?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleReload = () => {
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="error-page-wrapper">
      <SEO title={pageTitle} noIndex={true} />

      <div className="error-page-container">
        {/* Glow ambient decoration background */}
        <div className="error-ambient-glow" />

        {/* Hero Status Code & Badge */}
        <div className="error-hero-badge">
          <div
            className="error-tag-pill"
            style={{
              borderColor: config.badgeColor,
              color: config.badgeColor,
            }}
          >
            <i className={`fa-solid ${config.icon}`} />
            <span>{config.badgeText}</span>
          </div>

          <h1 className="error-code-number">{config.code}</h1>
          <h2 className="error-page-heading">{config.title}</h2>
          <p className="error-page-lead">{pageSubtitle}</p>
        </div>

        {/* Instant Search Bar */}
        <div className="error-search-card">
          <p className="error-search-label">
            <i className="fa-solid fa-magnifying-glass" /> Sedang mencari
            informasi atau pengumuman tertentu?
          </p>
          <form className="error-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="error-search-input"
              placeholder="Ketik kata kunci: lowongan kerja, UMKM kuliner, bakti sosial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="error-search-btn"
              aria-label="Cari Informasi"
            >
              <i className="fa-solid fa-arrow-right" /> Cari
            </button>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="error-actions-group">
          <Link to="/" className="error-action-btn error-action-btn--primary">
            <i className="fa-solid fa-house" /> Kembali ke Beranda
          </Link>
          <button
            type="button"
            className="error-action-btn error-action-btn--secondary"
            onClick={handleReload}
          >
            <i className="fa-solid fa-rotate-right" /> Muat Ulang Halaman
          </button>
          <button
            type="button"
            className="error-action-btn error-action-btn--ghost"
            onClick={() => navigate(-1)}
          >
            <i className="fa-solid fa-arrow-left" /> Halaman Sebelumnya
          </button>
          <a
            href="https://wa.me/6281234567890?text=Halo%20Pengurus%20Karang%20Taruna%20Rawa%20Arum,%20saya%20mengalami%20kendala%20saat%20mengakses%20website"
            target="_blank"
            rel="noopener noreferrer"
            className="error-action-btn error-action-btn--whatsapp"
          >
            <i className="fa-brands fa-whatsapp" /> Bantuan WhatsApp
          </a>
        </div>

        {/* Suggestions List */}
        {config.suggestions && config.suggestions.length > 0 && (
          <div className="error-tips-card">
            <h3 className="error-tips-title">
              <i className="fa-regular fa-lightbulb" /> Saran untuk Anda:
            </h3>
            <ul className="error-tips-list">
              {config.suggestions.map((tip, idx) => (
                <li key={idx}>
                  <i className="fa-solid fa-check" /> {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Technical Error Accordion for Developers / Pengurus in case of Error Boundary */}
        {errorDetails && (
          <div className="error-tech-accordion">
            <button
              type="button"
              className="error-tech-toggle"
              onClick={() => setShowTechDetails(!showTechDetails)}
            >
              <span>
                <i className="fa-solid fa-code" /> Informasi Teknis Error (Untuk
                Pengurus/Developer)
              </span>
              <i
                className={`fa-solid fa-chevron-${showTechDetails ? 'up' : 'down'}`}
              />
            </button>
            {showTechDetails && (
              <pre className="error-tech-stack">
                {errorDetails.toString()}
                {errorDetails.componentStack || ''}
              </pre>
            )}
          </div>
        )}

        {/* Quick Shortcut Grid */}
        <div className="error-quick-section">
          <h3 className="error-quick-heading">
            <i className="fa-solid fa-compass" /> Pintasan Halaman Utama
          </h3>
          <div className="error-quick-grid">
            {QUICK_LINKS.map((item, index) => (
              <Link to={item.path} key={index} className="error-quick-card">
                <div
                  className="error-quick-icon"
                  style={{
                    backgroundColor: `${item.color}15`,
                    color: item.color,
                  }}
                >
                  <i className={`fa-solid ${item.icon}`} />
                </div>
                <div className="error-quick-info">
                  <h4 className="error-quick-title">{item.title}</h4>
                  <p className="error-quick-desc">{item.desc}</p>
                </div>
                <div className="error-quick-arrow">
                  <i className="fa-solid fa-chevron-right" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
