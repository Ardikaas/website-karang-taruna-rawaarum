import { useState, useEffect } from 'react';
import { fetchSiteSettings } from '../services/api';
import { HERO_SLIDES } from '../constants/mockData';

const Hero = ({ currentSlide = 0, slides = HERO_SLIDES }) => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchSiteSettings();
        setSettings(data);
      } catch (_err) {
        // Fallback gracefully on API error
      }
    };
    loadSettings();
  }, []);

  const slideList =
    settings?.heroSlides && settings.heroSlides.length > 0
      ? settings.heroSlides
      : slides && slides.length > 0
        ? slides
        : HERO_SLIDES;

  const validSlideIndex =
    slideList.length > 0 ? (currentSlide || 0) % slideList.length : 0;
  const activeSlide = slideList[validSlideIndex] || slideList[0] || {};

  const hasTitle = Boolean(
    settings?.heroTitle && settings.heroTitle.trim() !== ''
  );
  const tagline =
    settings?.heroSubtitle ||
    activeSlide.title ||
    'Muda, Beda, Berkarya untuk Kemajuan Rawa Arum';

  const descText =
    settings?.heroDescription ||
    activeSlide.subtitle ||
    activeSlide.desc ||
    'Wadah pengembangan generasi muda Kelurahan Rawa Arum.';

  return (
    <section className="human-hero-section" id="home">
      {/* Background Slideshow Layer */}
      <div className="human-hero-bg">
        {slideList.map((slide, idx) => (
          <div
            key={idx}
            className={`human-slide-img ${validSlideIndex === idx ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${slide.image || '/assets/hero_banner.png'})`,
            }}
          />
        ))}
      </div>

      {/* Natural Left Dark Gradient Mask */}
      <div className="human-hero-mask"></div>

      {/* Container Layout */}
      <div className="container human-hero-container">
        <div className="human-hero-layout">
          {/* Left Column Text */}
          <div className="human-hero-left">
            <h1 className="human-title">
              {hasTitle ? (
                <>
                  <span className="hero-main-title-orange">
                    {settings.heroTitle}
                  </span>
                  <br />
                  <span className="hero-tagline-white">{tagline}</span>
                </>
              ) : (
                <span className="hero-main-title-orange">{tagline}</span>
              )}
            </h1>

            <div className="human-title-line"></div>

            <p className="human-desc">{descText}</p>

            <div className="human-actions">
              <a href="#pilar" className="btn btn-primary btn-hero">
                Tentang Kami <i className="fa-solid fa-arrow-right"></i>
              </a>
              <a href="#program" className="btn btn-outline-light btn-hero">
                Program Kerja
              </a>
            </div>
          </div>

          {/* Right Floating Highlight Card with Synced Fade-In Text */}
          <div className="human-hero-right">
            <div className="human-floating-card">
              {/* Stacked Content Slides for Synchronized Fade-in & Fade-out */}
              <div className="hcard-content-stack">
                {slideList.map((slide, idx) => (
                  <div
                    key={idx}
                    className={`hcard-slide-content ${
                      validSlideIndex === idx ? 'active' : ''
                    }`}
                  >
                    <h3 className="hcard-title">
                      {slide.title || 'Program Unggulan'}
                    </h3>
                    <p className="hcard-desc">{slide.subtitle || ''}</p>

                    <div className="hcard-counter-after-desc">
                      0{validSlideIndex + 1} / 0{slideList.length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
