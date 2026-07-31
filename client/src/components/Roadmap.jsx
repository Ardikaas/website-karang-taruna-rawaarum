import { useState, useEffect } from 'react';
import { fetchPrograms } from '../services/api';

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
    year: '2024',
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
    year: '2025',
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
    year: '2026',
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
    year: '2027',
  },
];

const Roadmap = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getItemYear = (item, idx) => {
    if (item.year) return item.year;
    if (item.status && /^\d{4}$/.test(item.status.trim()))
      return item.status.trim();
    return String(2024 + idx);
  };

  return (
    <section className="slidemodel-roadmap-section" id="program">
      <div className="container">
        <div className="section-header" data-watermark="ROADMAP">
          <span className="section-tag">Rencana Strategis</span>
          <h2 className="section-title">Roadmap Program Kerja</h2>
          <div className="title-underline"></div>
        </div>

        {/* Clean Vertical Timeline Stage */}
        <div className="sm-timeline-wrapper">
          {/* Straight Vertical Spine Line */}
          <div className="sm-straight-spine"></div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
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
                  className={`sm-timeline-row ${
                    isEven ? 'row-left' : 'row-right'
                  }`}
                >
                  {/* Left Column */}
                  <div className="sm-side sm-side-left">
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
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        ></div>

                        {item.target && (
                          <div className="sm-card-target">
                            <i className="fa-solid fa-bullseye"></i>{' '}
                            <strong>Target:</strong> {item.target}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="sm-pill-wrapper align-end">
                        <span className="sm-pill-badge sm-year-pill">
                          {displayYear}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Center Node & Horizontal Connector Line */}
                  <div className="sm-center-col">
                    <div className="sm-connector-line"></div>
                    <div className="sm-node-dot">
                      <div className="sm-node-inner"></div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="sm-side sm-side-right">
                    {isEven ? (
                      <div className="sm-pill-wrapper align-start">
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
                          dangerouslySetInnerHTML={{ __html: item.description }}
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
    </section>
  );
};

export default Roadmap;
