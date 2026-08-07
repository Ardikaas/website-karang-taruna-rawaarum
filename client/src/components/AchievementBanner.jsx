import React, { useState, useEffect } from 'react';

const CATEGORY_CONFIG = {
  pendidikan: {
    icon: 'fa-solid fa-graduation-cap',
    label: 'Pendidikan & Akademik',
    badgeClass: 'category-amber',
  },
  akademik: {
    icon: 'fa-solid fa-user-graduate',
    label: 'Akademik & Kelulusan',
    badgeClass: 'category-amber',
  },
  pernikahan: {
    icon: 'fa-solid fa-heart',
    label: 'Momentum Pernikahan',
    badgeClass: 'category-pink',
  },
  prestasi: {
    icon: 'fa-solid fa-trophy',
    label: 'Prestasi & Kebanggaan',
    badgeClass: 'category-teal',
  },
  lainnya: {
    icon: 'fa-solid fa-star',
    label: 'Apresiasi Spesial',
    badgeClass: 'category-purple',
  },
};

const AchievementBanner = ({ items = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Filter valid active items
  const activeItems = Array.isArray(items) ? items : [];

  // Auto-slide effect (6s looping interval)
  useEffect(() => {
    if (activeItems.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeItems.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [activeItems.length, isHovered]);

  if (activeItems.length === 0) return null;

  const currentItem = activeItems[currentIndex] || activeItems[0];
  const defaultPhoto = '/assets/potensi_umkm.png';
  const photo = currentItem.imageUrl || defaultPhoto;

  const catKey = (currentItem.category || 'prestasi').toLowerCase();
  const catConfig = CATEGORY_CONFIG[catKey] || CATEGORY_CONFIG.prestasi;

  const waNumber = (currentItem.whatsapp || '').replace(/[^0-9]/g, '');
  const waUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        `Selamat atas pencapaian "${currentItem.title}" untuk ${currentItem.memberName}! Semoga sukses dan berkah selalu.`
      )}`
    : null;

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + activeItems.length) % activeItems.length
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeItems.length);
  };

  return (
    <section className="achievement-section">
      {/* Background Animated Floating Sparkles */}
      <div className="achievement-bg-particles" aria-hidden="true">
        <span className="ach-particle p1">✦</span>
        <span className="ach-particle p2">★</span>
        <span className="ach-particle p3">✦</span>
        <span className="ach-particle p4">★</span>
        <span className="ach-particle p5">✦</span>
        <span className="ach-particle p6">★</span>
      </div>

      <div className="container">
        <div
          className="achievement-card"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Continuous Shimmer Light Sweep Overlay */}
          <div className="achievement-shimmer-sweep" aria-hidden="true" />

          {/* Top Tag Header */}
          <div className="achievement-card-header">
            <div className="achievement-top-meta">
              <span className={`achievement-tag ${catConfig.badgeClass}`}>
                <i className={catConfig.icon} /> {catConfig.label}
              </span>
              {currentItem.date && (
                <span className="achievement-date">
                  <i className="fa-regular fa-calendar" /> {currentItem.date}
                </span>
              )}
            </div>

            {/* Slider Navigation Counter & Controls */}
            {activeItems.length > 1 && (
              <div className="achievement-controls">
                <span className="achievement-counter">
                  {currentIndex + 1} / {activeItems.length} Apresiasi
                </span>
                <div className="achievement-nav-btns">
                  <button
                    onClick={handlePrev}
                    className="ach-nav-btn"
                    aria-label="Apresiasi Sebelumnya"
                    title="Sebelumnya"
                  >
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="ach-nav-btn"
                    aria-label="Apresiasi Selanjutnya"
                    title="Selanjutnya"
                  >
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="achievement-card-content">
            {/* Left: Avatar Ring with Continuous Glow Pulse */}
            <div className="achievement-avatar-col">
              <div className="achievement-avatar-ring">
                <div className="achievement-avatar-glow-ring" />
                <img
                  src={photo}
                  alt={currentItem.memberName}
                  className="achievement-avatar-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = defaultPhoto;
                  }}
                />
              </div>
            </div>

            {/* Right: Info & Message */}
            <div className="achievement-info-col">
              <span className="achievement-badge-header">
                <i className="fa-solid fa-ribbon" /> Ucapan & Apresiasi Pemuda
              </span>

              <h3 className="achievement-title">{currentItem.title}</h3>

              <div className="achievement-member-name">
                <i className="fa-solid fa-user-check" />{' '}
                {currentItem.memberName}
              </div>

              <div className="achievement-message-box">
                <i className="fa-solid fa-quote-left achievement-quote-icon" />
                <p className="achievement-message-text">
                  {currentItem.message ||
                    'Selamat dan sukses atas pencapaian luar biasa ini! Keluarga Besar Karang Taruna Kelurahan Rawa Arum turut bangga dan mendoakan keberkahan senantiasa menyertai.'}
                </p>
              </div>

              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="achievement-wa-button"
                >
                  <i className="fa-brands fa-whatsapp" /> Kirim Ucapan Selamat
                  via WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Bottom Indicators for Multi-Cards */}
          {activeItems.length > 1 && (
            <div className="achievement-dots-bar">
              {activeItems.map((_, idx) => (
                <button
                  key={idx}
                  className={`ach-dot ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Ke apresiasi ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AchievementBanner;
