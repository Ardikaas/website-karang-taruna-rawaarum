import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { buildBreadcrumbSchema } from '../constants/seoData';
import { PRIVACY_POLICY_DATA } from '../constants/legalData';

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState('pendahuluan');

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const sections = PRIVACY_POLICY_DATA.sections.map((s) => s.id);
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const breadcrumbs = [
    { name: 'Beranda', url: '/' },
    { name: 'Kebijakan Privasi', url: '/kebijakan-privasi' },
  ];

  return (
    <div className="legal-page-wrapper">
      <SEO
        title="Kebijakan Privasi Resmi - Karang Taruna Kelurahan Rawa Arum"
        description="Kebijakan Privasi resmi Karang Taruna Kelurahan Rawa Arum, Kecamatan Grogol, Cilegon. Kepatuhan perlindungan data pribadi UU PDP No. 27 Tahun 2022."
        canonicalUrl="/kebijakan-privasi"
        schema={buildBreadcrumbSchema(breadcrumbs)}
      />

      {/* Hero Header */}
      <header className="legal-hero-section">
        <div className="container">
          <div className="legal-hero-badge">
            <i className="fa-solid fa-shield-halved" /> Dokumen Hukum &amp;
            Kepatuhan UU PDP
          </div>
          <h1 className="legal-hero-title">Kebijakan Privasi</h1>
          <p className="legal-hero-subtitle">
            Transparansi tata kelola data pribadi warga, anggota pemuda, dan
            pelaku UMKM Kelurahan Rawa Arum.
          </p>

          <div className="legal-meta-bar">
            <div className="legal-meta-item">
              <i className="fa-regular fa-calendar-check" />
              <span>
                Pembaruan Terakhir:{' '}
                <strong>{PRIVACY_POLICY_DATA.lastUpdated}</strong>
              </span>
            </div>
            <div className="legal-meta-item">
              <i className="fa-solid fa-code-branch" />
              <span>
                Versi: <strong>{PRIVACY_POLICY_DATA.version}</strong>
              </span>
            </div>
            <div className="legal-meta-item">
              <i className="fa-solid fa-scale-balanced" />
              <span>
                Landasan: <strong>UU PDP No. 27/2022</strong>
              </span>
            </div>
            <button
              type="button"
              className="legal-print-btn"
              onClick={handlePrint}
              title="Cetak atau Simpan PDF Dokumen Ini"
            >
              <i className="fa-solid fa-print" /> Cetak / PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="container legal-layout-grid">
        {/* Sticky Table of Contents (Sidebar) */}
        <aside className="legal-sidebar">
          <div className="legal-toc-card">
            <h3 className="legal-toc-title">
              <i className="fa-solid fa-list-ol" /> Daftar Isi Kebijakan
            </h3>
            <nav className="legal-toc-nav">
              {PRIVACY_POLICY_DATA.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`legal-toc-link ${
                    activeSection === section.id ? 'active' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(section.id)?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                    setActiveSection(section.id);
                  }}
                >
                  <span className="legal-toc-dot" />
                  <span className="legal-toc-text">{section.title}</span>
                </a>
              ))}
            </nav>

            <div className="legal-toc-footer">
              <p className="legal-toc-helper">Perlu dokumen lainnya?</p>
              <Link to="/syarat-ketentuan" className="legal-switch-btn">
                <i className="fa-solid fa-file-contract" /> Baca Syarat &amp;
                Ketentuan
              </Link>
            </div>
          </div>
        </aside>

        {/* Legal Text Body */}
        <main className="legal-main-content">
          {/* Important Callout Box */}
          <div className="legal-callout-card">
            <div className="legal-callout-icon">
              <i className="fa-solid fa-shield-heart" />
            </div>
            <div className="legal-callout-text">
              <h4>Jaminan Keamanan Data Karang Taruna</h4>
              <p>
                Karang Taruna Kelurahan Rawa Arum{' '}
                <strong>tidak pernah dan tidak akan pernah menjual</strong> data
                pribadi Anda kepada pihak ketiga komersial manapun. Seluruh data
                diproses murni untuk keperluan sosial kelembagaan dan
                pemberdayaan ekonomi masyarakat.
              </p>
            </div>
          </div>

          {/* Document Sections */}
          <div className="legal-sections-wrapper">
            {PRIVACY_POLICY_DATA.sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="legal-section-block"
              >
                <h2 className="legal-section-heading">
                  <span className="legal-section-num">0{index + 1}</span>
                  {section.title}
                </h2>
                <div className="legal-section-text">
                  {section.content.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Contact Support Footer Card */}
          <div className="legal-support-card">
            <div className="legal-support-info">
              <h3>Punya Pertanyaan Mengenai Kebijakan Privasi Ini?</h3>
              <p>
                Tim Kesekretariatan Karang Taruna Kelurahan Rawa Arum siap
                melayani permintaan hak data pribadi dan klarifikasi hukum Anda.
              </p>
            </div>
            <div className="legal-support-actions">
              <Link
                to="/kontak"
                className="legal-action-btn legal-action-btn--primary"
              >
                <i className="fa-solid fa-envelope" /> Hubungi Sekretariat
              </Link>
              <a
                href="https://wa.me/6281234567890?text=Halo%20Sekretariat%20Karang%20Taruna%20Rawa%20Arum,%20saya%20ingin%20bertanya%20tentang%20Kebijakan%20Privasi"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-action-btn legal-action-btn--whatsapp"
              >
                <i className="fa-brands fa-whatsapp" /> Layanan WhatsApp
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
