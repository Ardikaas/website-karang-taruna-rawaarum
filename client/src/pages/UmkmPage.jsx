import { useState, useEffect } from 'react';
import { fetchUmkms } from '../services/api';
import InfoCard from '../components/InfoCard';
import { getUmkmDetailUrl } from '../utils/slugify';

const UmkmPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subCategory, setSubCategory] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchUmkms(subCategory, searchQuery);
      setItems(data);
      setLoading(false);
    };

    loadData();
  }, [subCategory, searchQuery]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredItems = items;

  return (
    <section
      className="informasi-section"
      style={{ paddingTop: '140px', minHeight: '85vh', paddingBottom: '5rem' }}
    >
      <div className="container">
        <div className="section-header" data-watermark="CATALOG">
          <span className="section-tag">
            Ekonomi Kreatif &amp; Usaha Pemuda Rawa Arum
          </span>
          <h2 className="section-title">Showcase Potensi UMKM</h2>
          <div className="title-underline"></div>
        </div>

        {/* Search & Sub-Category Filters */}
        <div className="info-controls" style={{ marginBottom: '2.5rem' }}>
          <div className="info-search-wrapper">
            <i className="fa-solid fa-magnifying-glass info-search-icon"></i>
            <input
              type="text"
              className="info-search-input"
              placeholder="Cari warung kuliner, kerajinan, bengkel, service AC, website..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="info-filters">
            {[
              { label: 'Semua UMKM', value: 'all' },
              { label: 'Produk & Kuliner', value: 'produk' },
              { label: 'Jasa & Layanan', value: 'jasa' },
            ].map((btn) => (
              <button
                key={btn.value}
                className={`filter-btn ${subCategory === btn.value ? 'active' : ''}`}
                onClick={() => setSubCategory(btn.value)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Showcase */}
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              color: 'var(--text-secondary)',
            }}
          >
            <i
              className="fa-solid fa-circle-notch fa-spin"
              style={{
                fontSize: '2.25rem',
                marginBottom: '1rem',
                color: 'var(--accent)',
              }}
            ></i>
            <p style={{ fontWeight: 600 }}>
              Memuat katalog &amp; etalase UMKM...
            </p>
          </div>
        ) : (
          <div className="grid-informasi">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <InfoCard
                  key={item._id}
                  item={item}
                  linkTo={getUmkmDetailUrl(item)}
                  customBtnText={
                    item.categoryType === 'jasa'
                      ? 'Lihat Detail Jasa'
                      : 'Lihat Detail UMKM'
                  }
                />
              ))
            ) : (
              <div className="info-empty">
                <i className="fa-solid fa-store info-empty-icon"></i>
                <p
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                  }}
                >
                  Tidak ada data UMKM yang cocok dengan filter atau kata kunci
                  pencarian Anda.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSubCategory('all');
                  }}
                  className="btn btn-outline"
                  style={{
                    borderRadius: '50px',
                    marginTop: '1rem',
                    padding: '0.4rem 1.25rem',
                  }}
                >
                  <i
                    className="fa-solid fa-rotate-left"
                    style={{ marginRight: '6px' }}
                  />{' '}
                  Reset Filter Pencarian
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default UmkmPage;
