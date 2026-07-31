import React from 'react';
import { Link } from 'react-router-dom';

const Pilars = () => {
  const services = [
    {
      icon: 'fa-solid fa-briefcase',
      tag: 'KARIR & KESEMPATAN',
      title: 'Info Lowongan Kerja',
      desc: 'Akses info lowongan kerja lokal, kesempatan karir, dan pelatihan keterampilan khusus pemuda Rawa Arum.',
      linkText: 'Lihat Lowongan Kerja',
      linkUrl: '/loker',
    },
    {
      icon: 'fa-solid fa-store',
      tag: 'PEMBERDAYAAN',
      title: 'Katalog & Pendataan UMKM',
      desc: 'Daftarkan dan promosikan produk usaha lokal Anda secara gratis di Portal UMKM Kelurahan Rawa Arum.',
      linkText: 'Jelajahi Portal UMKM',
      linkUrl: '/umkm',
    },
    {
      icon: 'fa-solid fa-comments',
      tag: 'PARTISIPASI WARGA',
      title: 'Kotak Masukan & Aspirasi',
      desc: 'Punya ide, saran, atau gagasan untuk kemajuan lingkungan? Sampaikan masukan Anda langsung kepada kami.',
      linkText: 'Kirim Masukan Warga',
      linkUrl: '/kontak',
    },
  ];

  return (
    <section className="quick-services-section" id="pilar">
      <div className="container">
        {/* Section Header */}
        <div
          className="section-header text-center"
          style={{ marginBottom: '2.5rem' }}
        >
          <span className="section-tag">Akses Pintar Warga</span>
          <h2 className="section-title">Layanan Cepat Karang Taruna</h2>
          <div className="title-underline"></div>
        </div>

        {/* 3 Interactive Cards Grid */}
        <div className="quick-services-grid">
          {services.map((item, idx) => (
            <div key={idx} className="quick-service-card">
              <div className="qs-card-accent-bar"></div>
              <div className="qs-icon-badge">
                <i className={item.icon}></i>
              </div>
              <div className="qs-body">
                <span className="qs-tag">{item.tag}</span>
                <h3 className="qs-title">{item.title}</h3>
                <p className="qs-desc">{item.desc}</p>
              </div>
              <div className="qs-footer">
                <Link to={item.linkUrl} className="qs-action-btn">
                  <span>{item.linkText}</span>
                  <i className="fa-solid fa-arrow-right-long"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pilars;
