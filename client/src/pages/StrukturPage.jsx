import { useState, useEffect } from 'react';
import { fetchPengurus, groupPengurusData } from '../services/api';
import { getAvatarPhoto } from '../constants/structureData';

const formatSocialUrl = (url = '') => {
  let trimmed = (url || '').trim();
  if (!trimmed) return '#';
  const lower = trimmed.toLowerCase();

  // Prevent XSS / malicious pseudo-protocols
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return '#';
  }

  // Prepend https:// if protocol is omitted (e.g. instagram.com/user)
  if (
    !lower.startsWith('http://') &&
    !lower.startsWith('https://') &&
    !lower.startsWith('mailto:') &&
    !lower.startsWith('tel:')
  ) {
    trimmed = `https://${trimmed}`;
  }

  return trimmed;
};

const getSocialIcon = (platform = '') => {
  const p = platform.toLowerCase();
  if (p.includes('ig') || p.includes('instagram'))
    return 'fa-brands fa-instagram';
  if (p.includes('tiktok')) return 'fa-brands fa-tiktok';
  if (p.includes('linkedin')) return 'fa-brands fa-linkedin';
  if (p.includes('facebook') || p.includes('fb'))
    return 'fa-brands fa-facebook';
  if (p.includes('youtube') || p.includes('yt')) return 'fa-brands fa-youtube';
  if (p.includes('twitter') || p.includes('x')) return 'fa-brands fa-x-twitter';
  if (p.includes('whatsapp') || p.includes('wa'))
    return 'fa-brands fa-whatsapp';
  if (p.includes('github')) return 'fa-brands fa-github';
  if (p.includes('web') || p.includes('website') || p.includes('globe'))
    return 'fa-solid fa-globe';
  return 'fa-solid fa-link';
};

const MemberPortraitCard = ({ member, cardClass = '' }) => {
  const socials = (member.socials || []).slice(0, 3);
  const hasSocials = socials.length > 0;
  const photoUrl = member.imageUrl || getAvatarPhoto(member.name);

  return (
    <div className={`member-portrait-card ${cardClass}`}>
      <div className="member-photo-wrapper">
        <img
          src={photoUrl}
          alt={member.name}
          className="member-portrait-img"
          onError={(e) => {
            e.target.src = getAvatarPhoto(member.name);
          }}
        />
      </div>
      <div
        className={`member-details-overlay ${hasSocials ? 'has-socials' : ''}`}
      >
        <div className="member-info-content">
          <h3 className="member-name">{member.name}</h3>
          <span className="member-role">{member.role || 'Anggota'}</span>
        </div>

        {hasSocials && (
          <div className="member-socials-wrapper">
            {socials.map((soc, idx) => {
              const handleText = soc.handle || soc.username || soc.platform;
              const cleanUrl = formatSocialUrl(soc.url);
              return (
                <a
                  key={idx}
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="member-social-row"
                  title={`${soc.platform}: ${handleText}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <i className={getSocialIcon(soc.platform)} />
                  <span className="member-social-handle">{handleText}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const StrukturPage = () => {
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadData = async () => {
      try {
        setLoading(true);
        const flatData = await fetchPengurus();
        const grouped = groupPengurusData(flatData);
        setStructure(grouped);
      } catch (_err) {
        setError('Gagal memuat data struktur organisasi.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div
        className="subpage-layout"
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <i
            className="fa-solid fa-spinner fa-spin"
            style={{
              fontSize: '2rem',
              color: 'var(--accent)',
              marginBottom: '1rem',
            }}
          />
          <p>Memuat Struktur Organisasi...</p>
        </div>
      </div>
    );
  }

  if (error || !structure) {
    return (
      <div
        className="subpage-layout"
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="container"
          style={{ textAlign: 'center', padding: '2rem' }}
        >
          <div
            className="admin-alert admin-alert--error"
            style={{ display: 'inline-flex', gap: '0.5rem' }}
          >
            <i className="fa-solid fa-circle-exclamation" />
            <span>{error || 'Gagal memuat data.'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="subpage-layout">
      {/* Background patterns */}
      <div className="subpage-bg-glow"></div>

      <div className="container subpage-container">
        {/* Header */}
        <div className="subpage-header">
          <div className="section-header" data-watermark="ORGANOGRAM">
            <span className="section-tag">BAGAN STRUKTUR LENGKAP</span>
            <h1 className="section-title">Struktur Organisasi Pengurus</h1>
            <div className="title-underline"></div>
          </div>
          <p className="subpage-intro">
            Kepengurusan resmi Karang Taruna Kelurahan Rawa Arum, Kec. Grogol,
            Kota Cilegon. Menampilkan seluruh jajaran Pengurus Harian hingga
            Bidang Kerja dan Anggota.
          </p>
        </div>

        {/* 1. PELINDUNG & PEMBINA */}
        {structure.pembina && (
          <div className="org-block">
            <h2 className="org-block-title">
              {structure.pembina.role || 'Pelindung & Pembina'}
            </h2>
            <div className="portrait-grid center-row">
              <MemberPortraitCard
                member={structure.pembina}
                cardClass="pembina"
              />
            </div>
          </div>
        )}

        {/* 2. PENGURUS HARIAN */}
        <div className="org-block">
          <h2 className="org-block-title">Pengurus Harian</h2>

          {/* Ketua */}
          <div className="portrait-grid center-row">
            {(structure.harian || [])
              .filter((h) => h && h.level === 1)
              .map((member) => (
                <MemberPortraitCard
                  key={member._id || member.id}
                  member={member}
                  cardClass="primary"
                />
              ))}
          </div>

          {/* Wakil Ketua */}
          <div className="portrait-grid grid-2">
            {(structure.harian || [])
              .filter((h) => h && h.level === 2)
              .map((member) => (
                <MemberPortraitCard
                  key={member._id || member.id}
                  member={member}
                />
              ))}
          </div>

          {/* Sekretaris & Bendahara */}
          <div className="portrait-grid grid-4">
            {(structure.harian || [])
              .filter((h) => h && h.level === 3)
              .map((member) => (
                <MemberPortraitCard
                  key={member._id || member.id}
                  member={member}
                  cardClass="compact"
                />
              ))}
          </div>
        </div>

        {/* 3. BIDANG-BIDANG KERJA */}
        <div className="org-block">
          <h2 className="org-block-title">Bidang Kerja &amp; Anggota</h2>

          <div className="bidang-sections-list">
            {(structure.bidang || []).map((b) => (
              <div key={b.id} id={b.id} className="bidang-section-card">
                <div className="bidang-header-bar">
                  <i className="fa-solid fa-shield-halved bidang-header-icon"></i>
                  <h3 className="bidang-section-title">{b.title}</h3>
                </div>

                <div className="bidang-content-layout">
                  {/* Koordinator Column */}
                  <div className="koor-column">
                    <span className="badge-koor">Koordinator</span>
                    {b.koordinatorDoc ? (
                      <MemberPortraitCard
                        member={b.koordinatorDoc}
                        cardClass="koor"
                      />
                    ) : (
                      <div
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.9rem',
                          fontStyle: 'italic',
                          padding: '1rem',
                        }}
                      >
                        Belum ditentukan
                      </div>
                    )}
                  </div>

                  {/* Anggota Column */}
                  <div className="anggota-column">
                    <span className="badge-anggota">Anggota Bidang</span>
                    {(b.anggotaDocs || []).length > 0 ? (
                      <div className="anggota-portrait-grid">
                        {(b.anggotaDocs || []).map((member) => (
                          <MemberPortraitCard
                            key={member._id || member.id}
                            member={member}
                            cardClass="anggota"
                          />
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.9rem',
                          fontStyle: 'italic',
                          padding: '1rem',
                        }}
                      >
                        Tidak ada anggota terdaftar
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrukturPage;
