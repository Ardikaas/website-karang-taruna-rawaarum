import React from 'react';

const Hero = ({ currentSlide, slides, onDotClick }) => {
  return (
    <section 
      className="hero-section" 
      id="home"
      style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
    >
      <div className="hero-overlay-left">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="hero-curve-svg">
          <path d="M0,0 L98,0 C103,25 93,65 78,100 L0,100 Z" fill="#0B2545" />
        </svg>
        <div className="hero-overlay-dots"></div>
      </div>
      
      <div className="container hero-container">
        <div className="hero-content">
          <h1 
            className="hero-title"
            dangerouslySetInnerHTML={{ __html: slides[currentSlide].title }}
          />
          <div className="hero-title-underline"></div>
          
          <p className="hero-desc">{slides[currentSlide].desc}</p>
          
          <div className="hero-buttons">
            <a href="#pilar" className="btn btn-primary">
              Tentang Kami
            </a>
            <a href="#program" className="btn btn-outline-light">
              Lihat Program Kerja
            </a>
          </div>
        </div>
      </div>

      <div className="hero-dots">
        {slides.map((_, idx) => (
          <span 
            key={idx} 
            className={`dot ${currentSlide === idx ? 'active' : ''}`}
            onClick={() => onDotClick(idx)}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
