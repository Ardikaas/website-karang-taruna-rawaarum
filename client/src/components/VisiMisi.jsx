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

  const visiText =
    settings?.visiText ||
    'Mewujudkan Karang Taruna Kelurahan Rawa Arum sebagai wadah pengembangan generasi muda yang mandiri, berkarakter, inovatif, dan berjiwa sosial tinggi demi membangun Rawa Arum yang maju dan sejahtera.';

  const misiList =
    settings?.misiList && settings.misiList.length > 0
      ? settings.misiList
      : [
          'Melaksanakan penguatan solidaritas dan komunikasi rutin antar anggota kepengurusan secara berkala.',
          'Mengembangkan potensi wirausaha pemuda guna melahirkan kemandirian finansial berbasis produk lokal.',
          'Aktif menyelenggarakan bakti sosial, kepedulian lingkungan hidup, serta tanggap bencana di Kelurahan.',
          'Mendorong implementasi teknologi informasi untuk membuka akses informasi loker dan UMKM bagi warga sekitar.',
        ];

  return (
    <section className="visi-misi-section" id="visi-misi">
      <div className="container">
        <div className="section-header" data-watermark="PROFILE">
          <span className="section-tag">FALSAFAH KAMI</span>
          <h2 className="section-title">Visi &amp; Misi</h2>
          <div className="title-underline"></div>
        </div>

        {/* Visi Showcase Box */}
        <div className="vm-visi-showcase">
          <div className="vm-visi-logo-col">
            <img
              src="/assets/karang-taruna-seeklogo.png"
              alt="Logo Karang Taruna Rawa Arum"
              className="vm-showcase-logo"
            />
            <span className="vm-showcase-tag">VISI UTAMA</span>
          </div>

          <div className="vm-visi-text-col">
            <p className="vm-showcase-quote">"{visiText}"</p>
          </div>
        </div>

        {/* Misi Pillar Grid (Clean, Non-Roadmap) */}
        <div className="vm-misi-section-wrapper">
          <h3 className="vm-misi-grid-title">Misi Organisasi</h3>

          <div className="vm-misi-grid">
            {misiList.map((misi, idx) => (
              <div key={idx} className="vm-misi-pillar-card">
                <div className="vm-pillar-header">
                  <span className="vm-pillar-num">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="vm-pillar-text">{misi}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisiMisi;
