import React from 'react';

const Informasi = ({ 
  infoItems, 
  loadingInfo, 
  filterType, 
  setFilterType, 
  searchQuery, 
  setSearchQuery, 
  filteredItems 
}) => {
  return (
    <section className="informasi-section" id="informasi">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">BERITA & UPDATE</span>
          <h2 className="section-title">Informasi Publik</h2>
          <div className="title-underline"></div>
        </div>

        {/* Controls */}
        <div className="info-controls">
          <div className="info-search-wrapper">
            <i className="fa-solid fa-magnifying-glass info-search-icon"></i>
            <input 
              type="text" 
              className="info-search-input" 
              placeholder="Cari info lowongan, umkm, atau kegiatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="info-filters">
            {[
              { label: 'Semua', value: 'all' },
              { label: 'Loker', value: 'loker' },
              { label: 'UMKM', value: 'umkm' },
              { label: 'Kegiatan', value: 'kegiatan' },
              { label: 'Penting', value: 'pengumuman' }
            ].map((btn) => (
              <button
                key={btn.value}
                className={`filter-btn ${filterType === btn.value ? 'active' : ''}`}
                onClick={() => setFilterType(btn.value)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loadingInfo ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent)' }}></i>
            <p>Memuat informasi terbaru...</p>
          </div>
        ) : (
          <div className="grid-informasi">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <article key={item._id} className="info-card">
                  <div className="info-image-wrapper">
                    <img src={item.imageUrl} alt={item.title} className="info-image" />
                    <div className={`info-tag-badge ${item.type === 'pengumuman' ? 'warning' : ''}`}>
                      {item.badge}
                    </div>
                  </div>
                  <div className="info-content">
                    <div className="info-meta">
                      <span><i className="fa-regular fa-calendar" style={{ marginRight: '6px' }}></i> {item.date}</span>
                    </div>
                    <h3 className="info-title">{item.title}</h3>
                    <p className="info-desc">{item.description}</p>
                    <a href="#kontak" className="info-btn">
                      {item.linkText} <i className="fa-solid fa-arrow-right-long"></i>
                    </a>
                  </div>
                </article>
              ))
            ) : (
              <div className="info-empty">
                <i className="fa-solid fa-folder-open info-empty-icon"></i>
                <p>Tidak ada informasi yang cocok dengan kata kunci atau filter terpilih.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Informasi;
