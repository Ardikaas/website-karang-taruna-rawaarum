import React from 'react';

const Roadmap = () => {
  return (
    <section className="roadmap-section" id="program">
      <div className="container">
        <div className="section-header" data-watermark="ROADMAP">
          <span className="section-tag">Rencana Strategis</span>
          <h2 className="section-title">Roadmap Program Kerja</h2>
          <div className="title-underline"></div>
        </div>

        <div className="roadmap-timeline">
          <div className="timeline-line"></div>
          
          <div className="timeline-item">
            <div className="timeline-dot"><i className="fa-solid fa-seedling"></i></div>
            <div className="timeline-content">
              <span className="timeline-year">2024</span>
              <h4 className="timeline-title">Fondasi & Penguatan Internal</h4>
              <p className="timeline-desc">Fokus pada restrukturisasi organisasi kelurahan Rawa Arum, konsolidasi pemuda lingkungan, dan pemetaan potensi kewilayahan.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"><i className="fa-solid fa-users"></i></div>
            <div className="timeline-content">
              <span className="timeline-year">2025</span>
              <h4 className="timeline-title">Pemberdayaan Masyarakat Aktif</h4>
              <p className="timeline-desc">Meluncurkan inkubasi UMKM kepemudaan, program donor darah massal, serta peningkatan sarana prasarana olahraga lingkungan.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"><i className="fa-solid fa-chart-line"></i></div>
            <div className="timeline-content">
              <span className="timeline-year">2026</span>
              <h4 className="timeline-title">Inovasi Digital & Kolaborasi Kerja</h4>
              <p className="timeline-desc">Mengembangkan portal karir pemuda Rawa Arum, menjalin kerja sama kemitraan industri industri sekitar Cilegon, dan pelatihan digital marketing.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"><i className="fa-solid fa-star"></i></div>
            <div className="timeline-content">
              <span className="timeline-year">2027+</span>
              <h4 className="timeline-title">Kemandirian Sosial Ekonomi</h4>
              <p className="timeline-desc">Menciptakan program ekonomi sirkular kepemudaan yang mapan, memberikan dampak kesejahteraan sosial jangka panjang berkelanjutan.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
