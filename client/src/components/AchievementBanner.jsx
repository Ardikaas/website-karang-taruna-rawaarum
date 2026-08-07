import React, { useState, useEffect } from 'react';

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
    <section className="achievement-section-light">
      <div className="container">
        <div
          className="achievement-light-card"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Top Bar Header */}
          <div className="achievement-light-header">
            <div className="achievement-light-meta">
              <span className="achievement-light-pill">
                <i className="fa-solid fa-trophy" /> APRESIASI & PENCAPAIAN
                ANGGOTA
              </span>
              {currentItem.date && (
                <span className="achievement-light-date">
                  <i className="fa-regular fa-calendar-check" />{' '}
                  {currentItem.date}
                </span>
              )}
            </div>

            {/* Slider Controls */}
            {activeItems.length > 1 && (
              <div className="achievement-light-controls">
                <span className="achievement-light-counter">
                  {currentIndex + 1} dari {activeItems.length} Apresiasi
                </span>
                <div className="achievement-light-nav">
                  <button
                    onClick={handlePrev}
                    className="ach-light-btn"
                    aria-label="Sebelumnya"
                    title="Sebelumnya"
                  >
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="ach-light-btn"
                    aria-label="Selanjutnya"
                    title="Selanjutnya"
                  >
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card Main Body */}
          <div className="achievement-light-body">
            {/* Left: Rectangular Photo Frame (preserves aspect ratio) */}
            <div className="achievement-light-photo-col">
              <div className="achievement-light-photo-frame">
                <img
                  src={photo}
                  alt={currentItem.memberName}
                  className="achievement-light-photo-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = defaultPhoto;
                  }}
                />
              </div>
            </div>

            {/* Right: Info & Message */}
            <div className="achievement-light-info-col">
              <h3 className="achievement-light-title">{currentItem.title}</h3>

              <div className="achievement-light-name">
                {currentItem.memberName}
              </div>

              <div className="achievement-light-quote">
                <p className="achievement-light-quote-text">
                  "
                  {currentItem.message ||
                    'Selamat dan sukses atas pencapaian luar biasa ini! Keluarga Besar Karang Taruna Kelurahan Rawa Arum turut bangga dan mendoakan keberkahan senantiasa menyertai.'}
                  "
                </p>
              </div>

              {waUrl && (
                <div style={{ marginTop: '1.25rem' }}>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="achievement-light-wa-btn"
                  >
                    <i className="fa-brands fa-whatsapp" /> Kirim Ucapan Selamat
                    via WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Dots Indicator */}
          {activeItems.length > 1 && (
            <div className="achievement-light-dots">
              {activeItems.map((_, idx) => (
                <button
                  key={idx}
                  className={`ach-light-dot ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Ke slide ${idx + 1}`}
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
