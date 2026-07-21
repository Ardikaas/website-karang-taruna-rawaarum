import React from 'react';

const VisiMisi = () => {
  return (
    <section className="visi-misi-section" id="visi-misi">
      <div className="container">
        <div className="section-header" data-watermark="PROFILE">
          <span className="section-tag">FALSAFAH KAMI</span>
          <h2 className="section-title">Visi & Misi</h2>
          <div className="title-underline"></div>
        </div>
        <div className="visi-misi-grid">
          <div className="visi-content">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', color: 'var(--primary-deep)' }}>Visi Utama</h3>
            <p className="visi-text">
              "Mewujudkan Karang Taruna Kelurahan Rawa Arum sebagai wadah pengembangan generasi muda yang mandiri, berkarakter, inovatif, dan berjiwa sosial tinggi demi membangun Rawa Arum yang maju dan sejahtera."
            </p>
          </div>
          <div className="misi-content">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', color: 'var(--primary-deep)' }}>Misi Organisasi</h3>
            <ul className="misi-list">
              <li className="misi-item">
                <span className="misi-num">1</span>
                <div className="misi-text-content">
                  <h4>Konsolidasi Internal</h4>
                  <p>Melaksanakan penguatan solidaritas dan komunikasi rutin antar anggota kepengurusan secara berkala.</p>
                </div>
              </li>
              <li className="misi-item">
                <span className="misi-num">2</span>
                <div className="misi-text-content">
                  <h4>Pemberdayaan Ekonomi Kreatif</h4>
                  <p>Mengembangkan potensi wirausaha pemuda guna melahirkan kemandirian finansial berbasis produk lokal.</p>
                </div>
              </li>
              <li className="misi-item">
                <span className="misi-num">3</span>
                <div className="misi-text-content">
                  <h4>Aksi Sosial Kemasyarakatan</h4>
                  <p>Aktif menyelenggarakan bakti sosial, kepedulian lingkungan hidup, serta tanggap bencana di Kelurahan.</p>
                </div>
              </li>
              <li className="misi-item">
                <span className="misi-num">4</span>
                <div className="misi-text-content">
                  <h4>Akselerasi Literasi Digital</h4>
                  <p>Mendorong implementasi teknologi informasi untuk membuka akses informasi loker dan UMKM bagi warga sekitar.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisiMisi;
