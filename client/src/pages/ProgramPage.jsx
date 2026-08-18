import { useState, useEffect } from 'react';
import { fetchPrograms } from '../services/api';
import SEO from '../components/SEO';
import { buildBreadcrumbSchema } from '../constants/seoData';
import { sanitizeHtml } from '../utils/sanitizeHtml';

const ProgramPage = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchPrograms();
        setPrograms(data);
      } catch (_err) {
        // Handled
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="subpage-layout">
      <SEO
        title="Program Kerja Strategis Karang Taruna Kelurahan Rawa Arum"
        description="Daftar pilar dan program kerja strategis Karang Taruna Rawa Arum dalam bidang sosial kemasyarakatan, pendidikan, ekonomi kreatif, lingkungan hidup, dan kepemudaan."
        keywords="Program Kerja Karang Taruna, Pilar Karang Taruna Rawa Arum, Agenda Kepemudaan Cilegon, Aksi Sosial Rawa Arum"
        canonicalUrl="/program"
        schema={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'AboutPage',
              name: 'Program Kerja Karang Taruna Rawa Arum',
              description:
                'Program kerja strategis dan pilar pengabdian Karang Taruna Kelurahan Rawa Arum, Kota Cilegon.',
              url: 'https://kttunasarum.com/program',
            },
            buildBreadcrumbSchema([{ name: 'Program Kerja', url: '/program' }]),
          ],
        }}
      />
      <div className="subpage-bg-glow"></div>

      <div className="container subpage-container">
        <div className="subpage-header text-center">
          <div className="section-header" data-watermark="PROGRAM">
            <span className="section-tag">PILAR & AGENDA KERJA</span>
            <h1 className="section-title">Program Kerja Resmi</h1>
            <div
              className="title-underline"
              style={{ margin: '0.5rem auto 1.25rem' }}
            ></div>
          </div>
          <p
            className="subpage-intro"
            style={{ margin: '0 auto', maxWidth: '600px' }}
          >
            Rangkaian pilar dan program kerja strategis Karang Taruna Kelurahan
            Rawa Arum untuk mewujudkan kemandirian sosial dan kemajuan generasi
            muda.
          </p>
        </div>

        <div className="org-block" style={{ marginTop: '3.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <i
                className="fa-solid fa-spinner fa-spin"
                style={{ color: 'var(--accent)', fontSize: '2rem' }}
              />
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                Memuat program kerja...
              </p>
            </div>
          ) : (
            <div className="grid-informasi">
              {programs.map((item) => (
                <article
                  key={item._id}
                  className="info-card"
                  style={{ padding: '1.75rem' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(249, 115, 22, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)',
                        fontSize: '1.25rem',
                        flexShrink: 0,
                      }}
                    >
                      <i
                        className={`fa-solid ${item.icon || 'fa-briefcase'}`}
                      />
                    </div>
                    <div>
                      <span
                        className="admin-badge admin-badge--accent-light"
                        style={{
                          fontSize: '0.75rem',
                          marginBottom: '4px',
                          display: 'inline-block',
                        }}
                      >
                        {item.category}
                      </span>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '1.15rem',
                          color: 'var(--primary-deep)',
                          fontWeight: '700',
                        }}
                      >
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <p
                    style={{
                      color: '#475569',
                      fontSize: '0.92rem',
                      lineHeight: '1.6',
                      marginBottom: '1.25rem',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(item.description),
                    }}
                  ></p>

                  <div
                    style={{
                      borderTop: '1px solid #edf2f7',
                      paddingTop: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>
                      <i
                        className="fa-solid fa-users"
                        style={{ marginRight: '4px' }}
                      />{' '}
                      {item.target}
                    </span>
                    <span
                      className={`admin-badge admin-badge--${item.status === 'Selesai' ? 'success' : item.status === 'Berjalan' ? 'primary' : 'warning'}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramPage;
