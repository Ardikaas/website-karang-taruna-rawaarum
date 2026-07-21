import React from 'react';

const Pilars = () => {
  return (
    <section className="pilar-section" id="pilar">
      <div className="container">
        <div className="grid-pilar">
          <div className="pilar-card">
            <div className="pilar-icon-wrapper">
              <i className="fa-solid fa-sitemap pilar-icon"></i>
            </div>
            <h3 className="pilar-title">Struktur Organisasi</h3>
            <p className="pilar-desc">Kenali kepengurusan Karang Taruna Rawa Arum yang solid, kolaboratif, dan siap melayani masyarakat.</p>
            <a href="#struktur" className="pilar-link">Lihat Bagan Kepengurusan <i className="fa-solid fa-arrow-right-long"></i></a>
          </div>

          <div className="pilar-card">
            <div className="pilar-icon-wrapper">
              <i className="fa-solid fa-bullseye pilar-icon"></i>
            </div>
            <h3 className="pilar-title">Visi & Misi</h3>
            <p className="pilar-desc">Komitmen dan arah perjuangan kami untuk mewujudkan generasi muda Rawa Arum yang mandiri dan berdaya.</p>
            <a href="#visi-misi" className="pilar-link">Lihat Visi & Misi <i className="fa-solid fa-arrow-right-long"></i></a>
          </div>

          <div className="pilar-card">
            <div className="pilar-icon-wrapper">
              <i className="fa-solid fa-route pilar-icon"></i>
            </div>
            <h3 className="pilar-title">Roadmap Program</h3>
            <p className="pilar-desc">Rencana program kerja strategis jangka panjang terarah untuk kesejahteraan masyarakat sekitar.</p>
            <a href="#program" className="pilar-link">Lihat Roadmap Kerja <i className="fa-solid fa-arrow-right-long"></i></a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pilars;
