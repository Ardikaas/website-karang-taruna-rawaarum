import { useEffect } from 'react';

const KemitraanPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const partners = [
    { id: 1, name: 'PT Hanindo Bakti Sejahtera', logo: '/assets/hanindo.png', type: 'Mitra Industri Utama' },
    { id: 2, name: 'PT Mutiara Alfini', logo: '/assets/mutiara_alfini.png', type: 'Mitra Pembangunan Wilayah' }
  ];

  const benefits = [
    {
      icon: 'fa-solid fa-users-gear',
      title: 'Akses Jaringan Pemuda',
      desc: 'Hubungkan bisnis Anda secara langsung dengan ribuan pemuda produktif dan masyarakat aktif di Kelurahan Rawa Arum.'
    },
    {
      icon: 'fa-solid fa-bullhorn',
      title: 'Publikasi & Branding',
      desc: 'Tingkatkan visibilitas brand Anda melalui penempatan logo di media sosial, situs resmi, baliho, dan kaos panitia kegiatan.'
    },
    {
      icon: 'fa-solid fa-hand-holding-heart',
      title: 'Kontribusi Sosial (CSR)',
      desc: 'Wujudkan tanggung jawab sosial perusahaan dengan menyokong program pemberdayaan masyarakat, UMKM lokal, dan kepedulian lingkungan.'
    },
    {
      icon: 'fa-solid fa-handshake-angle',
      title: 'Kolaborasi Strategis',
      desc: 'Peluang menyelenggarakan program pelatihan kerja, rekrutmen bersama (job fair), atau kompetisi kreatif kepemudaan.'
    }
  ];

  const packages = [
    {
      name: 'Platinum Sponsor',
      tag: 'SPONSOR UTAMA',
      benefits: [
        'Penempatan logo ukuran Ekstra Besar di semua media cetak utama',
        'Branding eksklusif di situs web & media sosial resmi',
        'Penyebutan nama perusahaan (ad-lips) di setiap pembukaan acara',
        'Slot stand promosi eksklusif di lokasi pusat kegiatan',
        'Hak memberikan sambutan perwakilan perusahaan saat seremonial'
      ],
      featured: true,
      color: '#0B2545'
    },
    {
      name: 'Gold Sponsor',
      tag: 'SPONSOR MADYA',
      benefits: [
        'Penempatan logo ukuran Besar di spanduk & baliho bersama',
        'Branding di situs web resmi',
        'Penyebutan nama perusahaan di awal dan akhir acara',
        'Pemberian brosur promosi di tas peserta kegiatan',
        'Sertifikat penghargaan kemitraan eksklusif'
      ],
      featured: false,
      color: '#f97316'
    },
    {
      name: 'Silver Sponsor',
      tag: 'SPONSOR PRATAMA',
      benefits: [
        'Penempatan logo ukuran Sedang di banner pendukung kegiatan',
        'Penyebutan nama perusahaan di akhir acara',
        'Penayangan logo pada kompilasi dokumentasi kegiatan',
        'Sertifikat penghargaan kemitraan'
      ],
      featured: false,
      color: '#6b7280'
    }
  ];

  return (
    <div className="subpage-layout">
      {/* Background glow effects */}
      <div className="subpage-bg-glow"></div>

      <div className="container subpage-container">
        {/* Header */}
        <div className="subpage-header">
          <div className="section-header" data-watermark="PARTNERS">
            <span className="section-tag">KOLABORASI & SPONSORSHIP</span>
            <h1 className="section-title">Kemitraan Karang Taruna</h1>
            <div className="title-underline"></div>
          </div>
          <p className="subpage-intro">
            Kami membuka pintu kolaborasi bagi sektor industri, swasta, akademisi, dan lembaga pemerintahan untuk bersinergi membangun potensi pemuda Kelurahan Rawa Arum.
          </p>
        </div>

        {/* Section 1: Current Partners */}
        <div className="org-block">
          <h2 className="org-block-title">Mitra Resmi Kami</h2>
          <div className="current-partners-grid">
            {partners.map((partner) => (
              <div key={partner.id} className="partner-detail-card" title={partner.name}>
                <div className="partner-logo-box">
                  <img src={partner.logo} alt={partner.name} className="partner-logo-img" />
                </div>
                <div className="partner-text-box">
                  <h3 className="partner-company-name">{partner.name}</h3>
                  <span className="partner-type-tag"><i className="fa-solid fa-award"></i> {partner.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Why Partner */}
        <div className="org-block">
          <h2 className="org-block-title">Mengapa Bermitra dengan Kami?</h2>
          <div className="benefits-grid">
            {benefits.map((b, idx) => (
              <div key={idx} className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <i className={b.icon}></i>
                </div>
                <h3 className="benefit-card-title">{b.title}</h3>
                <p className="benefit-card-desc">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Sponsorship Tiers */}
        <div className="org-block">
          <h2 className="org-block-title">Paket Sponsorship Program</h2>
          <div className="packages-grid">
            {packages.map((pkg, idx) => (
              <div key={idx} className={`package-card ${pkg.featured ? 'featured' : ''}`}>
                {pkg.featured && <div className="featured-badge">Terpopuler</div>}
                <div className="package-header" style={{ borderBottomColor: pkg.color }}>
                  <span className="package-tag-level" style={{ color: pkg.featured ? 'var(--accent)' : 'var(--text-muted)' }}>{pkg.tag}</span>
                  <h3 className="package-name">{pkg.name}</h3>
                </div>
                <ul className="package-benefits-list">
                  {pkg.benefits.map((benefit, bIdx) => (
                    <li key={bIdx} className="package-benefit-item">
                      <i className="fa-solid fa-circle-check check-icon"></i>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Call to Action */}
        <div className="partner-final-cta">
          <div className="cta-box-content">
            <h2 className="cta-box-title">Siap Berkolaborasi Membangun Pemuda?</h2>
            <p className="cta-box-desc">
              Unduh Proposal Kemitraan kami atau diskusikan model kerja sama yang paling sesuai dengan kebutuhan strategis perusahaan Anda.
            </p>
            <div className="cta-buttons-row">
              <a href="https://wa.me/628123456789" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <i className="fa-brands fa-whatsapp"></i> Hubungi via WhatsApp
              </a>
              <a href="#kontak" className="btn btn-outline" style={{ borderColor: 'rgba(255, 255, 255, 0.3)', color: '#ffffff' }}>
                <i className="fa-solid fa-file-pdf"></i> Unduh Proposal (PDF)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KemitraanPage;
