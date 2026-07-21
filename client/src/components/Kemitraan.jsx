import React from 'react';
import { Link } from 'react-router-dom';

const Kemitraan = () => {
  const partners = [
    { id: 1, name: 'PT Hanindo Bakti Sejahtera', logo: '/assets/hanindo.png' },
    { id: 2, name: 'PT Mutiara Alfini', logo: '/assets/mutiara_alfini.png' }
  ];

  return (
    <section className="partner-section" id="kemitraan">
      <div className="container">
        <div className="section-header" data-watermark="PARTNERS">
          <span className="section-tag">KOLABORASI INDUSTRI</span>
          <h2 className="section-title">Kemitraan & Sponsorship</h2>
          <div className="title-underline"></div>
        </div>

        <div className="grid-partners">
          {partners.map((partner) => (
            <div key={partner.id} className="partner-card" title={partner.name}>
              <img src={partner.logo} alt={partner.name} className="partner-logo-img" />
            </div>
          ))}
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
