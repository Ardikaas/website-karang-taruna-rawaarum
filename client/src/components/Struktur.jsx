import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPengurus } from '../services/api';

const STATIC_FALLBACK_BIDANG = [
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

const Struktur = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPengurus();
        setList(data);
      } catch (err) {
        console.error('Failed to load homepage organogram:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter specific nodes dynamically, fallback to static defaults if database empty
  const pembina = list.find(p => p.category === 'pembina') || { name: 'Kepala Kelurahan Rawa Arum' };
  const ketua = list.find(p => p.category === 'harian' && p.level === 1) || { name: 'Rifki Amrullah' };
  const wakil1 = list.find(p => p.category === 'harian' && p.level === 2 && p.role.includes('I')) || { name: 'Imamul Hakim, S.AP' };
  const wakil2 = list.find(p => p.category === 'harian' && p.level === 2 && p.role.includes('II')) || { name: 'Insan Ansori' };
  
  const sekretaris = list.find(p => p.category === 'harian' && p.role.toLowerCase() === 'sekretaris') || { name: 'Ibnu Aminudin, S.HI' };
  const bendahara = list.find(p => p.category === 'harian' && p.role.toLowerCase() === 'bendahara') || { name: 'Febri Kurniawan, S.E' };
  const wakilSekr = list.find(p => p.category === 'harian' && p.role.toLowerCase() === 'wakil sekretaris') || { name: 'Lendhia Marhani Pramesta, S.AP' };
  const wakilBend = list.find(p => p.category === 'harian' && p.role.toLowerCase() === 'wakil bendahara') || { name: 'Cahya Agung Prayoga, S.T' };

  // Filter koordinator list
  const dbKoordinatorList = list
    .filter(p => p.category === 'bidang' && p.isKoordinator)
    .map(p => ({
      title: p.bidangTitle ? p.bidangTitle.replace('Pemberdayaan ', '').replace('Kemandirian Organisasi dan ', '') : p.role,
      koor: p.name
    }));

  const displayKoordinatorList = dbKoordinatorList.length > 0 ? dbKoordinatorList : STATIC_FALLBACK_BIDANG;

  if (loading && list.length === 0) {
    return (
      <section className="org-section" id="struktur">
        <div className="container" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--accent)' }} />
        </div>
      </section>
    );
  }

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
              <div className="org-name">{pembina.name}</div>
            </div>
          </div>

          {/* Ketua */}
          <div className="org-row">
            <div className="org-node ketua-node">
              <div className="org-role">Ketua</div>
              <div className="org-name">{ketua.name}</div>
            </div>
          </div>

          {/* Wakil Ketua */}
          <div className="org-row split-row">
            <div className="org-node">
              <div className="org-role">Wakil Ketua I</div>
              <div className="org-name">{wakil1.name}</div>
            </div>
            <div className="org-node">
              <div className="org-role">Wakil Ketua II</div>
              <div className="org-name">{wakil2.name}</div>
            </div>
          </div>

          {/* Sekretaris & Bendahara */}
          <div className="org-row split-row">
            <div className="org-node">
              <div className="org-role">Sekretaris</div>
              <div className="org-name">{sekretaris.name}</div>
            </div>
            <div className="org-node">
              <div className="org-role">Bendahara</div>
              <div className="org-name">{bendahara.name}</div>
            </div>
          </div>

          {/* Wakil Sekr & Wakil Bend */}
          <div className="org-row split-row">
            <div className="org-node">
              <div className="org-role">Wakil Sekretaris</div>
              <div className="org-name">{wakilSekr.name}</div>
            </div>
            <div className="org-node">
              <div className="org-role">Wakil Bendahara</div>
              <div className="org-name">{wakilBend.name}</div>
            </div>
          </div>
        </div>

        <div className="org-subtitle">Koordinator Bidang Kerja</div>
        <div className="org-koor-grid">
          {displayKoordinatorList.map((bidang, idx) => (
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
