import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { buildBreadcrumbSchema } from '../constants/seoData';
import { TERMS_CONDITION_DATA } from '../constants/legalData';

const TermsConditionPage = () => {
  const [activeSection, setActiveSection] = useState('penerimaan');

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const sections = TERMS_CONDITION_DATA.sections.map((s) => s.id);
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
    { name: 'Syarat & Ketentuan', url: '/syarat-ketentuan' },
  ];

  return (
    <div className="legal-page-wrapper">
      <SEO
        title="Syarat & Ketentuan Penggunaan - Karang Taruna Kelurahan Rawa Arum"
        description="Syarat dan Ketentuan Penggunaan resmi Website Karang Taruna Kelurahan Rawa Arum, Grogol, Cilegon. Panduan pendaftaran anggota, etalase UMKM, dan etika layanan digital."
        canonicalUrl="/syarat-ketentuan"
        schema={buildBreadcrumbSchema(breadcrumbs)}
      />

      {/* Hero Header */}
      <header className="legal-hero-section">
        <div className="container">
          <div className="legal-hero-badge">
            <i className="fa-solid fa-file-contract" /> Ketentuan Hukum &amp;
            Pedoman Layanan
          </div>
          <h1 className="legal-hero-title">Syarat &amp; Ketentuan</h1>
          <p className="legal-hero-subtitle">
            Panduan hukum hak, kewajiban, dan etika penggunaan portal digital
            Karang Taruna Kelurahan Rawa Arum.
          </p>

          <div className="legal-meta-bar">
            <div className="legal-meta-item">
              <i className="fa-regular fa-calendar-check" />
              <span>
                Pembaruan Terakhir:{' '}
                <strong>{TERMS_CONDITION_DATA.lastUpdated}</strong>
              </span>
            </div>
            <div className="legal-meta-item">
              <i className="fa-solid fa-code-branch" />
              <span>
                Versi Dokumen: <strong>{TERMS_CONDITION_DATA.version}</strong>
              </span>
            </div>
            <div className="legal-meta-item">
              <i className="fa-solid fa-landmark" />
              <span>
                Yurisdiksi: <strong>Kota Cilegon, Indonesia</strong>
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
              <i className="fa-solid fa-list-check" /> Daftar Isi Ketentuan
            </h3>
            <nav className="legal-toc-nav">
              {TERMS_CONDITION_DATA.sections.map((section) => (
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
              <p className="legal-toc-helper">
                Ingin membaca perlindungan data?
              </p>
              <Link to="/kebijakan-privasi" className="legal-switch-btn">
                <i className="fa-solid fa-shield-halved" /> Baca Kebijakan
                Privasi
              </Link>
            </div>
          </div>
        </aside>

        {/* Legal Text Body */}
        <main className="legal-main-content">
          {/* Important Callout Box */}
          <div className="legal-callout-card legal-callout-card--accent">
            <div className="legal-callout-icon">
              <i className="fa-solid fa-circle-exclamation" />
            </div>
            <div className="legal-callout-text">
              <h4>Pemberitahuan Penting Transaksi Bebas Pungutan Liar</h4>
              <p>
                Karang Taruna Rawa Arum{' '}
                <strong>tidak memungut biaya apapun</strong> baik untuk
                pendaftaran anggota pemuda, promosi katalog UMKM, maupun
                penyaluran informasi lowongan kerja. Seluruh layanan digital ini
                didedikasikan murni untuk kemajuan warga Rawa Arum.
              </p>
            </div>
          </div>

          {/* Document Sections */}
          <div className="legal-sections-wrapper">
            {TERMS_CONDITION_DATA.sections.map((section, index) => (
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
              <h3>Perlu Bantuan atau Klarifikasi Ketentuan?</h3>
              <p>
                Pengurus Karang Taruna Kelurahan Rawa Arum senantiasa terbuka
                untuk musyawarah, saran, dan koordinasi kemitraan positif.
              </p>
            </div>
            <div className="legal-support-actions">
              <Link
                to="/kontak"
                className="legal-action-btn legal-action-btn--primary"
              >
                <i className="fa-solid fa-envelope" /> Form Aspirasi &amp;
                Kontak
              </Link>
              <a
                href="https://wa.me/6281234567890?text=Halo%20Pengurus%20Karang%20Taruna%20Rawa%20Arum,%20saya%20ingin%20berkonsultasi%20tentang%20Syarat%20dan%20Ketentuan"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-action-btn legal-action-btn--whatsapp"
              >
                <i className="fa-brands fa-whatsapp" /> WhatsApp Pengurus
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TermsConditionPage;
