import { useState, useEffect } from 'react';

import { fetchInfoItems } from '../services/api';
import InfoCard from '../components/InfoCard';
import SEO from '../components/SEO';
import { buildBreadcrumbSchema } from '../constants/seoData';

const PengumumanPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchInfoItems('pengumuman');
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
    <section
      className="informasi-section"
      style={{ paddingTop: '140px', minHeight: '80vh' }}
    >
      <SEO
        title="Papan Pengumuman & Rilis Resmi Karang Taruna Kelurahan Rawa Arum"
        description="Pengumuman resmi, edaran organisasi, serta informasi penting dari Karang Taruna Kelurahan Rawa Arum, Kecamatan Grogol, Kota Cilegon."
        keywords="Pengumuman Rawa Arum, Edaran Karang Taruna, Berita Resmi Rawa Arum, Info Kelurahan Rawa Arum Cilegon"
        canonicalUrl="/pengumuman"
        schema={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              name: 'Papan Pengumuman Resmi Karang Taruna Rawa Arum',
              description:
                'Pengumuman dan edaran resmi dari Karang Taruna Kelurahan Rawa Arum, Cilegon.',
              url: 'https://kttunasarum.com/pengumuman',
            },
            buildBreadcrumbSchema([{ name: 'Pengumuman', url: '/pengumuman' }]),
          ],
        }}
      />
      <div className="container">
        <div className="section-header" data-watermark="NOTICE">
          <span className="section-tag">Papan Pengumuman Resmi</span>
          <h2 className="section-title">Pengumuman Penting</h2>
          <div className="title-underline"></div>
        </div>

        {/* Search Control */}
        <div className="info-controls">
          <div className="info-search-wrapper">
            <i className="fa-solid fa-magnifying-glass info-search-icon"></i>
            <input
              type="text"
              className="info-search-input"
              placeholder="Cari surat edaran, rilis pengumuman..."
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
            <p>Memuat pengumuman...</p>
          </div>
        ) : (
          <div className="grid-informasi">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <InfoCard
                  key={item._id}
                  item={{ ...item, type: 'pengumuman' }}
                />
              ))
            ) : (
              <div className="info-empty">
                <i className="fa-solid fa-bullhorn info-empty-icon"></i>
                <p>Belum ada rilis pengumuman baru dari Kelurahan Rawa Arum.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default PengumumanPage;
