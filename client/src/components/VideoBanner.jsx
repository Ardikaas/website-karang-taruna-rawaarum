import { Link } from 'react-router-dom';

const VideoBanner = () => {
  return (
    <section className="video-banner-section">
      {/* High Performance Streaming Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/assets/hero_banner.png"
        className="video-banner-element"
      >
        <source src="/assets/hero-bg-video.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay Gradient Mask */}
      <div className="video-banner-mask" />

      {/* Overlay Content */}
      <div className="container video-banner-container">
        <div className="video-banner-content">
          <h2 className="video-banner-title">
            Sinergi &amp; Karya Nyata Pemuda Rawa Arum
          </h2>

          <p className="video-banner-desc">
            Menyaksikan langsung semangat kebersamaan, aksi sosial, dan dedikasi
            Karang Taruna dalam membangun potensi Kelurahan Rawa Arum.
          </p>

          <div className="video-banner-actions">
            <Link
              to="/kegiatan"
              className="btn btn-primary"
              style={{ borderRadius: '50px', padding: '0.75rem 1.75rem' }}
            >
              Lihat Seluruh Kegiatan{' '}
              <i
                className="fa-solid fa-arrow-right-long"
                style={{ marginLeft: '8px' }}
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoBanner;
