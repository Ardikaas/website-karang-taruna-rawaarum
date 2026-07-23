import { useState, useEffect } from 'react';
import { fetchPengurus, groupPengurusData } from '../services/api';
import { getAvatarPhoto } from '../constants/structureData';

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
      } catch (err) {
        setError('Gagal memuat data struktur organisasi.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="subpage-layout" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--accent)', marginBottom: '1rem' }} />
          <p>Memuat Struktur Organisasi...</p>
        </div>
      </div>
    );
  }

  if (error || !structure) {
    return (
      <div className="subpage-layout" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="admin-alert admin-alert--error" style={{ display: 'inline-flex', gap: '0.5rem' }}>
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
            Kepengurusan resmi Karang Taruna Kelurahan Rawa Arum, Kec. Grogol, Kota Cilegon. Menampilkan seluruh jajaran Pengurus Harian hingga Bidang Kerja dan Anggota.
          </p>
        </div>

        {/* 1. PELINDUNG & PEMBINA */}
        {structure.pembina && (
          <div className="org-block">
            <h2 className="org-block-title">{structure.pembina.role || 'Pelindung & Pembina'}</h2>
            <div className="portrait-grid center-row">
              <div className="member-portrait-card pembina">
                <div className="member-photo-wrapper">
                  <img 
                    src={structure.pembina.imageUrl || '/assets/avatar_m1.png'} 
                    alt={structure.pembina.name} 
                    className="member-portrait-img" 
                    onError={(e) => { e.target.src = '/assets/avatar_m1.png' }}
                  />
                </div>
                <div className="member-details-overlay">
                  <h3 className="member-name">{structure.pembina.name}</h3>
                  <span className="member-role">{structure.pembina.role}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PENGURUS HARIAN */}
        <div className="org-block">
          <h2 className="org-block-title">Pengurus Harian</h2>

          {/* Ketua */}
          <div className="portrait-grid center-row">
            {structure.harian.filter((h) => h.level === 1).map((member) => (
              <div key={member._id} className="member-portrait-card primary">
                <div className="member-photo-wrapper">
                  <img 
                    src={member.imageUrl || getAvatarPhoto(member.name)} 
                    alt={member.name} 
                    className="member-portrait-img" 
                    onError={(e) => { e.target.src = getAvatarPhoto(member.name) }}
                  />
                </div>
                <div className="member-details-overlay">
                  <h3 className="member-name">{member.name}</h3>
                  <span className="member-role">{member.role}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Wakil Ketua */}
          <div className="portrait-grid grid-2">
            {structure.harian.filter((h) => h.level === 2).map((member) => (
              <div key={member._id} className="member-portrait-card">
                <div className="member-photo-wrapper">
                  <img 
                    src={member.imageUrl || getAvatarPhoto(member.name)} 
                    alt={member.name} 
                    className="member-portrait-img" 
                    onError={(e) => { e.target.src = getAvatarPhoto(member.name) }}
                  />
                </div>
                <div className="member-details-overlay">
                  <h3 className="member-name">{member.name}</h3>
                  <span className="member-role">{member.role}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sekretaris & Bendahara */}
          <div className="portrait-grid grid-4">
            {structure.harian.filter((h) => h.level === 3).map((member) => (
              <div key={member._id} className="member-portrait-card compact">
                <div className="member-photo-wrapper">
                  <img 
                    src={member.imageUrl || getAvatarPhoto(member.name)} 
                    alt={member.name} 
                    className="member-portrait-img" 
                    onError={(e) => { e.target.src = getAvatarPhoto(member.name) }}
                  />
                </div>
                <div className="member-details-overlay">
                  <h3 className="member-name">{member.name}</h3>
                  <span className="member-role">{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. BIDANG-BIDANG KERJA */}
        <div className="org-block">
          <h2 className="org-block-title">Bidang Kerja & Anggota</h2>

          <div className="bidang-sections-list">
            {structure.bidang.map((b) => (
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
                      <div className="member-portrait-card koor">
                        <div className="member-photo-wrapper">
                          <img 
                            src={b.koordinatorDoc.imageUrl || getAvatarPhoto(b.koordinator)} 
                            alt={b.koordinator} 
                            className="member-portrait-img" 
                            onError={(e) => { e.target.src = getAvatarPhoto(b.koordinator) }}
                          />
                        </div>
                        <div className="member-details-overlay">
                          <h4 className="member-name">{b.koordinator}</h4>
                          <span className="member-role">{b.koordinatorDoc.role || 'Koordinator Bidang'}</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem' }}>
                        Belum ditentukan
                      </div>
                    )}
                  </div>

                  {/* Anggota Column */}
                  <div className="anggota-column">
                    <span className="badge-anggota">Anggota Bidang</span>
                    {b.anggotaDocs.length > 0 ? (
                      <div className="anggota-portrait-grid">
                        {b.anggotaDocs.map((member) => (
                          <div key={member._id} className="member-portrait-card anggota">
                            <div className="member-photo-wrapper">
                              <img 
                                src={member.imageUrl || getAvatarPhoto(member.name)} 
                                alt={member.name} 
                                className="member-portrait-img" 
                                onError={(e) => { e.target.src = getAvatarPhoto(member.name) }}
                              />
                            </div>
                            <div className="member-details-overlay">
                              <h4 className="member-name">{member.name}</h4>
                              <span className="member-role">{member.role || 'Anggota'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem' }}>
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
