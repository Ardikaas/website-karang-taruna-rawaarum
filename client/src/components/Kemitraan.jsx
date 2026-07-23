import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPartners } from '../services/api';

const Kemitraan = () => {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    const loadPartners = async () => {
      const data = await fetchPartners();
      setPartners(data);
    };
    loadPartners();
  }, []);

  return (
    <section className="partner-section" id="kemitraan">
      <div className="container">
        <div className="section-header" data-watermark="PARTNERS">
          <span className="section-tag">KOLABORASI INDUSTRI</span>
          <h2 className="section-title">Kemitraan & Sponsorship</h2>
          <div className="title-underline"></div>
        </div>

        <div className="grid-partners">
          {partners.length > 0 ? (
            partners.map((partner) => (
              <div key={partner._id} className="partner-card" title={partner.name}>
                {partner.logoUrl ? (
                  <img src={partner.logoUrl} alt={partner.name} className="partner-logo-img" />
                ) : (
                  <div style={{ fontWeight: '700', color: 'var(--primary-deep)', fontSize: '1rem', padding: '1rem', textAlign: 'center' }}>
                    {partner.name}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="partner-card">
              <span style={{ color: 'var(--text-muted)' }}>Belum ada logo mitra</span>
            </div>
          )}
        </div>

        <div className="partner-cta">
          <Link to="/kemitraan" className="btn btn-outline">
            <i className="fa-regular fa-handshake"></i> Informasi Kemitraan & Sponsorship
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Kemitraan;
