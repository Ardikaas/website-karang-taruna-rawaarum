import { useState, useEffect, useRef } from 'react';
import { fetchPrograms } from '../services/api';
import { sanitizeHtml } from '../utils/sanitizeHtml';

const DEFAULT_PROGRAMS = [
  {
    _id: 'p1',
    title: 'Pelatihan Wirausaha Digital Pemuda',
    category: 'Ekonomi & UMKM',
    description:
      'Program pendampingan dan pelatihan branding, pemasaran digital, dan pendaftaran NIB bagi pemuda pemilik UMKM di Kelurahan Rawa Arum.',
    target: '50+ Pelaku UMKM & Pemuda Kreatif',
    status: 'Sedang Berjalan',
    icon: 'fa-chart-line',
    year: '2026',
  },
  {
    _id: 'p2',
    title: 'Bakti Sosial & Penghijauan Lingkungan',
    category: 'Sosial & Lingkungan',
    description:
      'Aksi gotong royong pembersihan saluran air, penanaman 200 bibit pohon produktif, dan penyaluran sembako warga kurang mampu.',
    target: 'Seluruh RW di Kelurahan Rawa Arum',
    status: 'Selesai',
    icon: 'fa-chalkboard-user',
    year: '2027',
  },
  {
    _id: 'p3',
    title: 'Turnamen Olahraga & Seni Pemuda',
    category: 'Kepemudaan & Olahraga',
    description:
      'Ajang kompetisi futsal, bulu tangkis, dan pentas seni budaya antar Karang Taruna RW se-Kelurahan Rawa Arum.',
    target: '200+ Pemuda & Remaja Rawa Arum',
    status: 'Terencana',
    icon: 'fa-shapes',
    year: '2028',
  },
  {
    _id: 'p4',
    title: 'Portal Digital Loker & Pelatihan Kerja',
    category: 'Informasi & Teknologi',
    description:
      'Pengembangan platform informasi lowongan kerja industri lokal dan sertifikasi keahlian bekerjasama dengan perusahaan mitra.',
    target: 'Pencari Kerja Rawa Arum',
    status: 'Sedang Berjalan',
    icon: 'fa-book-open',
    year: '2029',
  },
];

const Roadmap = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const isInteracting = useRef(false);
  const activeIdx = useRef(0);

  useEffect(() => {
    const loadPrograms = async () => {
      setLoading(true);
      const data = await fetchPrograms();
      if (Array.isArray(data) && data.length > 0) {
        setPrograms(data);
      } else {
        setPrograms(DEFAULT_PROGRAMS);
      }
      setLoading(false);
    };
    loadPrograms();
  }, []);

  const displayPrograms = programs.length > 0 ? programs : DEFAULT_PROGRAMS;

  useEffect(() => {
    if (loading || displayPrograms.length === 0) return;

    const interval = setInterval(() => {
      if (window.innerWidth >= 992) return;
      if (isInteracting.current) return;

      activeIdx.current = (activeIdx.current + 1) % displayPrograms.length;
      if (scrollRef.current) {
        const container = scrollRef.current;
        const itemWidth = container.scrollWidth / displayPrograms.length;
        container.scrollTo({
          left: activeIdx.current * itemWidth,
          behavior: 'smooth',
        });
      }
    }, 3800);

    return () => clearInterval(interval);
  }, [loading, displayPrograms.length]);

  const getItemYear = (item, idx) => {
    if (item.year) return item.year;
    if (item.status && /^\d{4}$/.test(item.status.trim()))
      return item.status.trim();
    return String(2026 + idx);
  };

  return (
    <section className="slidemodel-roadmap-section" id="program">
      <div className="container">
        <div className="section-header" data-watermark="ROADMAP">
          <span className="section-tag">Rencana Strategis</span>
          <h2 className="section-title">Roadmap Program Kerja</h2>
          <div className="title-underline"></div>
        </div>

        {/* Horizontal Scroll Stage */}
        <div
          className="sm-horizontal-scroll-container"
          ref={scrollRef}
          onMouseEnter={() => {
            isInteracting.current = true;
          }}
          onMouseLeave={() => {
            isInteracting.current = false;
          }}
          onTouchStart={() => {
            isInteracting.current = true;
          }}
          onTouchEnd={() => {
            setTimeout(() => {
              isInteracting.current = false;
            }, 3000);
          }}
        >
          <div className="sm-horizontal-timeline">
            {/* Continuous Horizontal Spine Line */}
            <div className="sm-horizontal-spine"></div>

            {loading ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 5rem',
                  width: '100%',
                }}
              >
                <i
                  className="fa-solid fa-spinner fa-spin"
                  style={{ color: 'var(--accent)', fontSize: '2rem' }}
                ></i>
              </div>
            ) : (
              displayPrograms.map((item, idx) => {
                const displayYear = getItemYear(item, idx);
                const isEven = idx % 2 === 0;

                return (
                  <div
                    key={item._id || idx}
                    className={`sm-horizontal-column ${
                      isEven ? 'col-top-card' : 'col-bottom-card'
                    }`}
                  >
                    {/* Top Section */}
                    <div className="sm-h-top">
                      {isEven ? (
                        <div className="sm-content-card">
                          <div className="sm-card-head">
                            <div className="sm-icon-circle">
                              <i
                                className={`fa-solid ${
                                  item.icon || 'fa-chart-line'
                                }`}
                              ></i>
                            </div>
                            <div>
                              <span className="sm-cat-label">
                                {item.category || 'Program'}
                              </span>
                              <h3 className="sm-card-title">{item.title}</h3>
                            </div>
                          </div>

                          <div
                            className="sm-card-desc"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeHtml(item.description),
                            }}
                          ></div>

                          {item.target && (
                            <div className="sm-card-target">
                              <i className="fa-solid fa-bullseye"></i>{' '}
                              <strong>Target:</strong> {item.target}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="sm-pill-wrapper">
                          <span className="sm-pill-badge sm-year-pill">
                            {displayYear}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Center Node & Vertical Connector Line */}
                    <div className="sm-h-center">
                      <div className="sm-h-connector"></div>
                      <div className="sm-node-dot">
                        <div className="sm-node-inner"></div>
                      </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="sm-h-bottom">
                      {isEven ? (
                        <div className="sm-pill-wrapper">
                          <span className="sm-pill-badge sm-year-pill">
                            {displayYear}
                          </span>
                        </div>
                      ) : (
                        <div className="sm-content-card">
                          <div className="sm-card-head">
                            <div className="sm-icon-circle">
                              <i
                                className={`fa-solid ${
                                  item.icon || 'fa-chart-line'
                                }`}
                              ></i>
                            </div>
                            <div>
                              <span className="sm-cat-label">
                                {item.category || 'Program'}
                              </span>
                              <h3 className="sm-card-title">{item.title}</h3>
                            </div>
                          </div>

                          <div
                            className="sm-card-desc"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeHtml(item.description),
                            }}
                          ></div>

                          {item.target && (
                            <div className="sm-card-target">
                              <i className="fa-solid fa-bullseye"></i>{' '}
                              <strong>Target:</strong> {item.target}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
