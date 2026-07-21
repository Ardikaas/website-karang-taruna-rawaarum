import { useEffect } from 'react';

import { structureData, getAvatarPhoto } from '../constants/structureData';

const StrukturPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        <div className="org-block">
          <h2 className="org-block-title">Pelindung & Pembina</h2>
          <div className="portrait-grid center-row">
            <div className="member-portrait-card pembina">
              <div className="member-photo-wrapper">
                <img src="/assets/avatar_m1.png" alt={structureData.pembina.name} className="member-portrait-img" />
              </div>
              <div className="member-details-overlay">
                <h3 className="member-name">{structureData.pembina.name}</h3>
                <span className="member-role">{structureData.pembina.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PENGURUS HARIAN */}
        <div className="org-block">
          <h2 className="org-block-title">Pengurus Harian</h2>

          {/* Ketua */}
          <div className="portrait-grid center-row">
            {structureData.harian.filter((h) => h.level === 1).map((member, idx) => (
              <div key={idx} className="member-portrait-card primary">
                <div className="member-photo-wrapper">
                  <img src={getAvatarPhoto(member.name)} alt={member.name} className="member-portrait-img" />
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
            {structureData.harian.filter((h) => h.level === 2).map((member, idx) => (
              <div key={idx} className="member-portrait-card">
                <div className="member-photo-wrapper">
                  <img src={getAvatarPhoto(member.name)} alt={member.name} className="member-portrait-img" />
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
            {structureData.harian.filter((h) => h.level === 3).map((member, idx) => (
              <div key={idx} className="member-portrait-card compact">
                <div className="member-photo-wrapper">
                  <img src={getAvatarPhoto(member.name)} alt={member.name} className="member-portrait-img" />
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
            {structureData.bidang.map((b) => (
              <div key={b.id} id={b.id} className="bidang-section-card">
                <div className="bidang-header-bar">
                  <i className="fa-solid fa-shield-halved bidang-header-icon"></i>
                  <h3 className="bidang-section-title">{b.title}</h3>
                </div>

                <div className="bidang-content-layout">
                  {/* Koordinator Column */}
                  <div className="koor-column">
                    <span className="badge-koor">Koordinator</span>
                    <div className="member-portrait-card koor">
                      <div className="member-photo-wrapper">
                        <img src={getAvatarPhoto(b.koordinator)} alt={b.koordinator} className="member-portrait-img" />
                      </div>
                      <div className="member-details-overlay">
                        <h4 className="member-name">{b.koordinator}</h4>
                        <span className="member-role">Koordinator Bidang</span>
                      </div>
                    </div>
                  </div>

                  {/* Anggota Column */}
                  <div className="anggota-column">
                    <span className="badge-anggota">Anggota Bidang</span>
                    <div className="anggota-portrait-grid">
                      {b.anggota.map((name, idx) => (
                        <div key={idx} className="member-portrait-card anggota">
                          <div className="member-photo-wrapper">
                            <img src={getAvatarPhoto(name)} alt={name} className="member-portrait-img" />
                          </div>
                          <div className="member-details-overlay">
                            <h4 className="member-name">{name}</h4>
                            <span className="member-role">Anggota</span>
                          </div>
                        </div>
                      ))}
                    </div>
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
