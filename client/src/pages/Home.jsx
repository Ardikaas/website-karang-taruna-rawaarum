import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import Hero from '../components/Hero';
import Pilars from '../components/Pilars';
import VisiMisi from '../components/VisiMisi';
import Struktur from '../components/Struktur';
import Roadmap from '../components/Roadmap';
import Kemitraan from '../components/Kemitraan';

import InfoCard from '../components/InfoCard';

import { HERO_SLIDES } from '../constants/mockData';
import { fetchRecentItems } from '../services/api';

const SLIDE_INTERVAL_MS = 6000;

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start hero slideshow
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);

    // Fetch recent info items for preview section
    const loadRecentItems = async () => {
      setLoading(true);
      const items = await fetchRecentItems();
      setRecentItems(items);
      setLoading(false);
    };

    loadRecentItems();

    return () => {
      if (slideInterval.current) clearInterval(slideInterval.current);
    };
  }, []);

  const handleDotClick = (index) => {
    if (slideInterval.current) clearInterval(slideInterval.current);
    setCurrentSlide(index);
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
  };

  return (
    <>
      <Hero
        currentSlide={currentSlide}
        slides={HERO_SLIDES}
        onDotClick={handleDotClick}
      />
      <Pilars />
      <VisiMisi />
      <Struktur />
      <Roadmap />
      <Kemitraan />

      {/* Information Preview Section */}
      <section
        className="informasi-section"
        id="informasi"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <div className="container">
          <div className="section-header" data-watermark="UPDATES">
            <span className="section-tag">Kabar Rawa Arum</span>
            <h2 className="section-title">Informasi & Berita Terbaru</h2>
            <div className="title-underline"></div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <i
                className="fa-solid fa-circle-notch fa-spin"
                style={{ color: 'var(--accent)', fontSize: '1.5rem' }}
              ></i>
            </div>
          ) : (
            <div className="grid-informasi" style={{ marginBottom: '3.5rem' }}>
              {recentItems.map((item) => (
                <InfoCard key={item._id} item={item} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <Link
              to="/kegiatan"
              className="btn btn-outline"
              style={{ borderRadius: '50px' }}
            >
              Lihat Seluruh Portal Informasi{' '}
              <i
                className="fa-solid fa-arrow-right-long"
                style={{ marginLeft: '6px' }}
              ></i>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
