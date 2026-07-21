import React from 'react';
import { Link } from 'react-router-dom';

const Struktur = () => {
  const bidangList = [
    { title: 'Aparatur & Kaderisasi', koor: 'Derico' },
    { title: 'Advokasi, HAM & LH', koor: 'Aneka Rosani, S.H' },
    { title: 'Hub. Industri & Lembaga', koor: 'Fiki Kosasih' },
    { title: 'Pemberdayaan Perempuan & Anak', koor: 'Nila Nurmala Dewi, S.I.Kom' },
    { title: 'Media, Data & Informasi', koor: 'Dodi' },
    { title: 'Seni, Budaya & Olahraga', koor: 'Nafis Setiyadi' },
    { title: 'Ekonomi Kreatif', koor: 'Imron Rosyadi' },
    { title: 'Pendidikan & Keagamaan', koor: 'Dewi Kurnia, S.Sos' },
    { title: 'Sosial & Mitigasi Bencana', koor: 'Suhebi' }
  ];

  return (
    <section className="org-section" id="struktur">
      <div className="container">
        <div className="section-header" data-watermark="ORGANOGRAM">
          <span className="section-tag">ORGANOGRAM</span>
          <h2 className="section-title">Struktur Organisasi</h2>
          <div className="title-underline"></div>
        </div>

        <div className="org-tree">
          {/* Pembina */}
          <div className="org-row">
            <div className="org-node pembina-node">
              <div className="org-role">Pelindung / Pembina</div>
              <div className="org-name">Kepala Kelurahan Rawa Arum</div>
            </div>
          </div>

          {/* Ketua */}
          <div className="org-row">
            <div className="org-node ketua-node">
              <div className="org-role">Ketua</div>
              <div className="org-name">Rifki Amrullah</div>
            </div>
          </div>

          {/* Wakil Ketua */}
          <div className="org-row split-row">
            <div className="org-node">
              <div className="org-role">Wakil Ketua I</div>
              <div className="org-name">Imamul Hakim, S.AP</div>
            </div>
            <div className="org-node">
              <div className="org-role">Wakil Ketua II</div>
              <div className="org-name">Insan Ansori</div>
            </div>
          </div>

          {/* Sekretaris & Bendahara */}
          <div className="org-row split-row">
            <div className="org-node">
              <div className="org-role">Sekretaris</div>
              <div className="org-name">Ibnu Aminudin, S.HI</div>
            </div>
            <div className="org-node">
              <div className="org-role">Bendahara</div>
              <div className="org-name">Febri Kurniawan, S.E</div>
            </div>
          </div>

          {/* Wakil Sekr & Wakil Bend */}
          <div className="org-row split-row">
            <div className="org-node">
              <div className="org-role">Wakil Sekretaris</div>
              <div className="org-name">Lendhia Marhani Pramesta, S.AP</div>
            </div>
            <div className="org-node">
              <div className="org-role">Wakil Bendahara</div>
              <div className="org-name">Cahya Agung Prayoga, S.T</div>
            </div>
          </div>
        </div>

        <div className="org-subtitle">Koordinator Bidang Kerja</div>
        <div className="org-koor-grid">
          {bidangList.map((bidang, idx) => (
            <div key={idx} className="koor-card">
              <div className="koor-title">{bidang.title}</div>
              <div className="koor-name">{bidang.koor}</div>
              <div className="koor-role">Koordinator</div>
            </div>
          ))}
        </div>

        <div className="org-cta">
          <Link to="/struktur" className="btn btn-primary">
            <i className="fa-solid fa-sitemap"></i> Lihat Struktur Lengkap & Anggota
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Struktur;
