import { useState, useEffect } from 'react';

import { fetchInfoItems } from '../services/api';
import InfoCard from '../components/InfoCard';

const KegiatanPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [kegiatanData, beritaData] = await Promise.all([
        fetchInfoItems('kegiatan'),
        fetchInfoItems('berita'),
      ]);
      const combined = [
        ...(Array.isArray(beritaData) ? beritaData : []),
        ...(Array.isArray(kegiatanData) ? kegiatanData : []),
      ];
      setItems(combined);
      setLoading(false);
    };

    loadData();
    window.scrollTo(0, 0);
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesSearch =
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <section
      className="informasi-section"
      style={{ paddingTop: '140px', minHeight: '80vh' }}
    >
      <div className="container">
        <div className="section-header" data-watermark="ACTIVITIES">
          <span className="section-tag">Aksi & Informasi Pemuda</span>
          <h2 className="section-title">Berita & Dokumentasi Kegiatan</h2>
          <div className="title-underline"></div>
        </div>

        {/* Search & Filter Controls */}
        <div
          className="info-controls"
          style={{
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'stretch',
          }}
        >
          <div className="info-search-wrapper">
            <i className="fa-solid fa-magnifying-glass info-search-icon"></i>
            <input
              type="text"
              className="info-search-input"
              placeholder="Cari berita atau agenda kegiatan sosial, seni, olahraga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="info-filters">
            {[
              { label: 'Semua', value: 'all' },
              { label: 'Berita Terkini', value: 'berita' },
              { label: 'Agenda & Kegiatan', value: 'kegiatan' },
            ].map((btn) => (
              <button
                key={btn.value}
                className={`filter-btn ${activeTab === btn.value ? 'active' : ''}`}
                onClick={() => setActiveTab(btn.value)}
              >
                {btn.label}
              </button>
            ))}
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
            <p>Memuat berita kegiatan...</p>
          </div>
        ) : (
          <div className="grid-informasi">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <InfoCard key={item._id} item={item} />
              ))
            ) : (
              <div className="info-empty">
                <i className="fa-solid fa-camera-retro info-empty-icon"></i>
                <p>
                  Belum ada dokumentasi atau berita kegiatan pemuda saat ini.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default KegiatanPage;
