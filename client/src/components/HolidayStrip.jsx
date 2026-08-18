import { useState, useEffect } from 'react';
import { fetchActiveHolidays, formatImageUrl } from '../services/api';

const THEME_CONFIG = {
  'merah-putih': {
    gradient:
      'linear-gradient(135deg, #dc2626 0%, #b91c1c 40%, #ffffff 70%, #dc2626 100%)',
    textColor: '#ffffff',
    accentColor: '#fbbf24',
    particles: ['🇮🇩', '🎆', '⭐'],
  },
  'religi-hijau': {
    gradient:
      'linear-gradient(135deg, #064e3b 0%, #047857 45%, #10b981 80%, #fbbf24 100%)',
    textColor: '#ffffff',
    accentColor: '#fde68a',
    particles: ['🌙', '⭐', '✨'],
  },
  natal: {
    gradient:
      'linear-gradient(135deg, #991b1b 0%, #16a34a 40%, #991b1b 80%, #fbbf24 100%)',
    textColor: '#ffffff',
    accentColor: '#fde68a',
    particles: ['🎄', '🎅', '❄️'],
  },
  'tahun-baru': {
    gradient:
      'linear-gradient(135deg, #1e1b4b 0%, #4338ca 40%, #7c3aed 70%, #fbbf24 100%)',
    textColor: '#ffffff',
    accentColor: '#c4b5fd',
    particles: ['🎆', '🎇', '🥂'],
  },
  kartini: {
    gradient:
      'linear-gradient(135deg, #be185d 0%, #ec4899 45%, #f9a8d4 80%, #fbbf24 100%)',
    textColor: '#ffffff',
    accentColor: '#fce7f3',
    particles: ['🌸', '💐', '🌺'],
  },
  custom: {
    gradient: 'linear-gradient(135deg, #0b2545, #134074)',
    textColor: '#ffffff',
    accentColor: '#fbbf24',
    particles: ['🎉', '✨', '🎊'],
  },
};

const HolidayStrip = () => {
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const loadHolidays = async () => {
      const data = await fetchActiveHolidays();
      setHolidays(data || []);
    };
    loadHolidays();
  }, []);

  if (holidays.length === 0) return null;

  return (
    <div className="holiday-strip-wrapper">
      {holidays.map((event) => {
        const themeKey = event.theme || 'merah-putih';
        const config = THEME_CONFIG[themeKey] || THEME_CONFIG['merah-putih'];

        const hasCustomImage = Boolean(event.bannerImageUrl);
        const hasCustomParticles =
          Array.isArray(event.particleImages) &&
          event.particleImages.length > 0;
        const bgStyle = hasCustomImage
          ? {
              backgroundImage: `url(${formatImageUrl(event.bannerImageUrl)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : themeKey === 'custom' && event.customColor
            ? {
                background: `linear-gradient(135deg, ${event.customColor}, ${adjustColor(event.customColor, 40)})`,
              }
            : { background: config.gradient };

        const textShadowStyle = hasCustomImage
          ? {
              textShadow:
                '0 2px 4px rgba(0, 0, 0, 0.75), 0 0 10px rgba(0, 0, 0, 0.4)',
            }
          : {};

        return (
          <div
            key={event._id}
            className={`holiday-strip holiday-theme--${themeKey}`}
            style={bgStyle}
          >
            {/* Floating Particles */}
            <div className="holiday-particles" aria-hidden="true">
              {hasCustomParticles
                ? [
                    ...event.particleImages,
                    ...event.particleImages,
                    ...event.particleImages,
                  ]
                    .slice(0, 8)
                    .map((imgUrl, i) => (
                      <span
                        key={`png-${i}`}
                        className={`holiday-particle ${i % 2 === 1 ? 'holiday-particle--right' : ''}`}
                        style={{
                          left: `${8 + i * 11}%`,
                          animationDelay: `${(i * 0.7) % 3.5}s`,
                          animationDuration: `${3.8 + (i % 3) * 0.6}s`,
                        }}
                      >
                        <img
                          src={formatImageUrl(imgUrl)}
                          alt=""
                          className="holiday-particle-img"
                          style={{
                            width: `${26 + (i % 3) * 8}px`,
                            height: `${26 + (i % 3) * 8}px`,
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
                          }}
                        />
                      </span>
                    ))
                : config.particles.map((p, i) => (
                    <span
                      key={i}
                      className="holiday-particle"
                      style={{
                        left: `${10 + i * 30}%`,
                        animationDelay: `${i * 1.2}s`,
                        fontSize: `${1.1 + (i % 3) * 0.2}rem`,
                      }}
                    >
                      {p}
                    </span>
                  ))}
            </div>

            {/* Content */}
            <div className="holiday-strip-content container">
              {!hasCustomImage && (
                <div className="holiday-emoji-left" aria-hidden="true">
                  {event.emoji || '🎉'}
                </div>
              )}
              <div className="holiday-text-center">
                {event.title ? (
                  <span
                    className="holiday-title"
                    style={{ color: config.textColor, ...textShadowStyle }}
                  >
                    {event.title}
                  </span>
                ) : null}
                {event.subtitle ? (
                  <span
                    className="holiday-subtitle"
                    style={{ color: config.accentColor, ...textShadowStyle }}
                  >
                    {event.subtitle}
                  </span>
                ) : null}
              </div>
              {!hasCustomImage && (
                <div className="holiday-emoji-right" aria-hidden="true">
                  {event.emoji || '🎉'}
                </div>
              )}
            </div>

            {/* Shimmer Overlay */}
            <div className="holiday-shimmer" aria-hidden="true"></div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Lighten or darken a hex color by a given amount.
 */
const adjustColor = (hex, amount) => {
  let color = hex.replace('#', '');
  if (color.length === 3) {
    color = color
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(color, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

export default HolidayStrip;
