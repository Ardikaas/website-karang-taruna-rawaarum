import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPartners, fetchUmkms, formatImageUrl } from '../services/api';
import { getUmkmDetailUrl } from '../utils/slugify';

const formatWebsiteUrl = (url = '') => {
  const trimmed = (url || '').trim();
  if (!trimmed || trimmed === '#') return null;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return null;
  }

  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    return `https://${trimmed}`;
  }

  return trimmed;
};

const Kemitraan = () => {
  const [companyPartners, setCompanyPartners] = useState([]);
  const [umkmPartners, setUmkmPartners] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const partnerData = await fetchPartners();
      const rawPartners = Array.isArray(partnerData) ? partnerData : [];

      // Filter company/instansi partners vs UMKM category partners
      const companies = rawPartners.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        return !cat.includes('umkm');
      });

      const partnerUmkms = rawPartners.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        return cat.includes('umkm');
      });

      // Also fetch real verified UMKMs
      const umkmData = await fetchUmkms();
      const realUmkms = Array.isArray(umkmData) ? umkmData : [];

      setCompanyPartners(companies);
      setUmkmPartners([...partnerUmkms, ...realUmkms]);
    };
    loadData();
  }, []);

  return (
    <section className="partner-section" id="kemitraan">
      <div className="container">
        <div className="section-header" data-watermark="PARTNERS">
          <span className="section-tag">KOLABORASI INDUSTRI &amp; UMKM</span>
          <h2 className="section-title">Kemitraan &amp; Sponsorship</h2>
          <div className="title-underline"></div>
        </div>

        {/* SECTION 1 (ATAS): PERUSAHAAN & INSTANSI PEMBINA */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3
            style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              color: 'var(--primary-deep)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <i
              className="fa-solid fa-building"
              style={{ color: 'var(--accent)' }}
            />
            Perusahaan &amp; Instansi Pembina
          </h3>

          <div className="grid-partners">
            {companyPartners.length > 0 ? (
              companyPartners.map((partner) => {
                const webUrl = formatWebsiteUrl(partner.websiteUrl);
                const CardTag = webUrl ? 'a' : 'div';
                const linkProps = webUrl
                  ? {
                      href: webUrl,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    }
                  : {};

                return (
                  <CardTag
                    key={partner._id || partner.id}
                    className="partner-card"
                    title={partner.name}
                    style={{ textDecoration: 'none' }}
                    {...linkProps}
                  >
                    {partner.logoUrl ? (
                      <img
                        src={formatImageUrl(partner.logoUrl)}
                        alt={partner.name}
                        className="partner-logo-img"
                      />
                    ) : (
                      <div
                        style={{
                          fontWeight: '700',
                          color: 'var(--primary-deep)',
                          fontSize: '0.95rem',
                          padding: '1rem',
                          textAlign: 'center',
                        }}
                      >
                        {partner.name}
                      </div>
                    )}
                  </CardTag>
                );
              })
            ) : (
              <div className="partner-card">
                <span style={{ color: 'var(--text-muted)' }}>
                  Belum ada logo perusahaan
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2 (BAWAH): MITRA UMKM BINAAN RAWA ARUM */}
        <div>
          <h3
            style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              color: 'var(--primary-deep)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <i className="fa-solid fa-store" style={{ color: '#16a34a' }} />
            Mitra UMKM Rawa Arum
          </h3>

          <div className="grid-partners">
            {umkmPartners.length > 0 ? (
              umkmPartners.slice(0, 6).map((item) => (
                <Link
                  key={item._id || item.id}
                  to={getUmkmDetailUrl(item)}
                  className="partner-card"
                  title={item.title || item.name}
                  style={{
                    textDecoration: 'none',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  {item.imageUrl || item.logoUrl ? (
                    <img
                      src={item.imageUrl || item.logoUrl}
                      alt={item.title || item.name}
                      className="partner-logo-img"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/potensi_umkm.png';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontWeight: '700',
                        color: 'var(--primary-deep)',
                        fontSize: '0.95rem',
                        padding: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      {item.title || item.name}
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <div
                className="partner-card"
                style={{
                  gridColumn: '1 / -1',
                  maxWidth: '520px',
                  margin: '0 auto',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: '1px dashed #cbd5e1',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <i
                  className="fa-solid fa-shop"
                  style={{
                    fontSize: '1.5rem',
                    color: '#94a3b8',
                    marginBottom: '0.5rem',
                    display: 'block',
                  }}
                />
                <span
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                >
                  Belum ada UMKM Rawa Arum terdaftar.
                </span>
                <div style={{ marginTop: '0.6rem' }}>
                  <Link
                    to="/umkm"
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--accent)',
                      fontWeight: 800,
                      textDecoration: 'none',
                    }}
                  >
                    + Lihat &amp; Daftarkan UMKM Rawa Arum{' '}
                    <i className="fa-solid fa-arrow-right" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="partner-cta" style={{ marginTop: '2.5rem' }}>
          <Link to="/kemitraan" className="btn btn-outline">
            <i className="fa-regular fa-handshake"></i> Informasi Kemitraan
            &amp; Sponsorship
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Kemitraan;
