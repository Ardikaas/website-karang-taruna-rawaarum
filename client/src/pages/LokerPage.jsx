import { useState, useEffect } from 'react';
import { fetchInfoItems } from '../services/api';
import InfoCard from '../components/InfoCard';
import SEO from '../components/SEO';
import { buildBreadcrumbSchema } from '../constants/seoData';

const LokerPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchInfoItems('loker');
      setItems(data);
      setLoading(false);
    };

    loadData();
    window.scrollTo(0, 0);
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="subpage-layout">
      <SEO
        title="Lowongan Kerja & Pusat Karir Pemuda Rawa Arum - Kota Cilegon"
        description="Informasi lowongan kerja terbaru, magang industri, dan pelatihan keahlian kerja bagi generasi muda di wilayah Kelurahan Rawa Arum dan Kota Cilegon."
        keywords="Loker Cilegon, Lowongan Kerja Rawa Arum, Magang Cilegon, Karir Pemuda Cilegon, Pelatihan Kerja Banten"
        canonicalUrl="/loker"
        schema={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              name: 'Pusat Karir & Lowongan Kerja Karang Taruna Rawa Arum',
              description:
                'Pusat informasi karir, lowongan kerja industri, magang, dan pelatihan kerja Kelurahan Rawa Arum.',
              url: 'https://kttunasarum.com/loker',
            },
            buildBreadcrumbSchema([{ name: 'Lowongan Kerja', url: '/loker' }]),
          ],
        }}
      />
      <div className="subpage-bg-glow"></div>
      <div className="container subpage-container">
        <div className="subpage-header">
          <div className="section-header" data-watermark="CAREERS">
            <span className="section-tag">Pusat Karir Pemuda</span>
            <h1 className="section-title">Lowongan Kerja & Pelatihan</h1>
            <div className="title-underline"></div>
          </div>
          <p className="subpage-intro">
            Informasi peluang kerja, magang industri, dan pelatihan keterampilan
            bagi generasi muda Kelurahan Rawa Arum.
          </p>
        </div>

        {/* Search Control */}
        <div className="info-controls" style={{ marginBottom: '2.5rem' }}>
          <div className="info-search-wrapper">
            <i className="fa-solid fa-magnifying-glass info-search-icon"></i>
            <input
              type="text"
              className="info-search-input"
              placeholder="Cari lowongan pekerjaan, magang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-secondary)',
            }}
          >
            <i
              className="fa-solid fa-circle-notch fa-spin"
              style={{
                fontSize: '2rem',
                marginBottom: '1rem',
                color: 'var(--accent)',
              }}
            ></i>
            <p>Memuat lowongan kerja...</p>
          </div>
        ) : (
          <div className="grid-informasi">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <InfoCard key={item._id} item={item} />
              ))
            ) : (
              <div className="info-empty">
                <i className="fa-solid fa-briefcase info-empty-icon"></i>
                <p>
                  Belum ada lowongan pekerjaan yang cocok atau tersedia saat
                  ini.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LokerPage;
