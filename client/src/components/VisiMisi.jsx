import { useState, useEffect } from 'react';
import { fetchSiteSettings } from '../services/api';

const VisiMisi = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchSiteSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);

  const visiText = settings?.visiText || "Mewujudkan Karang Taruna Kelurahan Rawa Arum sebagai wadah pengembangan generasi muda yang mandiri, berkarakter, inovatif, dan berjiwa sosial tinggi demi membangun Rawa Arum yang maju dan sejahtera.";
  
  const misiList = (settings?.misiList && settings.misiList.length > 0) ? settings.misiList : [
    "Melaksanakan penguatan solidaritas dan komunikasi rutin antar anggota kepengurusan secara berkala.",
    "Mengembangkan potensi wirausaha pemuda guna melahirkan kemandirian finansial berbasis produk lokal.",
    "Aktif menyelenggarakan bakti sosial, kepedulian lingkungan hidup, serta tanggap bencana di Kelurahan.",
    "Mendorong implementasi teknologi informasi untuk membuka akses informasi loker dan UMKM bagi warga sekitar."
  ];

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
              "{visiText}"
            </p>
          </div>
          <div className="misi-content">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', color: 'var(--primary-deep)' }}>Misi Organisasi</h3>
            <ul className="misi-list">
              {misiList.map((misi, idx) => (
                <li key={idx} className="misi-item">
                  <span className="misi-num">{idx + 1}</span>
                  <div className="misi-text-content">
                    <p style={{ marginTop: 0, fontSize: '0.95rem' }}>{misi}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisiMisi;
