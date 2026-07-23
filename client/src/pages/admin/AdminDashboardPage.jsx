import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminStats } from '../../services/api';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err) {
      setError('Gagal memuat statistik. Pastikan server aktif.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading-container">
        <i className="fa-solid fa-spinner fa-spin admin-spinner" />
        <p>Memuat data statistik...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page-container">
        <div className="admin-alert admin-alert--error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
          <button className="admin-btn admin-btn--outline admin-btn--sm" onClick={loadStats} style={{ marginLeft: '1rem' }}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard Overview</h1>
          <p className="admin-page-subtitle">Ringkasan data dan aktivitas digital Karang Taruna.</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <i className="fa-solid fa-newspaper" />
          </div>
          <div>
            <div className="admin-stat-card__label">Total Konten/Info</div>
            <div className="admin-stat-card__value">{stats.totalInfo}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <i className="fa-solid fa-users" />
          </div>
          <div>
            <div className="admin-stat-card__label">Pendaftaran Anggota</div>
            <div className="admin-stat-card__value">{stats.totalAnggota}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <i className="fa-solid fa-envelope-open-text" />
          </div>
          <div>
            <div className="admin-stat-card__label">Newsletter Subscribers</div>
            <div className="admin-stat-card__value">{stats.totalSubscriber}</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Recent Activity */}
      <div className="admin-activity-grid">
        {/* Left Column: Recent Registrations */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">
              <i className="fa-solid fa-user-plus" /> Registrasi Anggota Terbaru
            </h2>
            <Link to="/admin/anggota" className="admin-card__header-link">
              Lihat Semua
            </Link>
          </div>
          <div className="admin-card__body" style={{ padding: 0 }}>
            {stats.recentAnggota.length > 0 ? (
              <ul className="admin-recent-list">
                {stats.recentAnggota.map((m) => (
                  <li key={m._id} className="admin-recent-item">
                    <div className="admin-recent-item__avatar">
                      {m.name[0].toUpperCase()}
                    </div>
                    <div className="admin-recent-item__content">
                      <div className="admin-recent-item__title">{m.name}</div>
                      <div className="admin-recent-item__desc">{m.email} &bull; {m.phone}</div>
                    </div>
                    <span className="admin-badge admin-badge--accent-light" style={{ marginLeft: 'auto' }}>
                      {m.interest}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="admin-empty-state">
                <p>Belum ada registrasi anggota baru.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Content */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">
              <i className="fa-solid fa-file-pen" /> Konten Terbitan Terbaru
            </h2>
            <Link to="/admin/konten" className="admin-card__header-link">
              Kelola Konten
            </Link>
          </div>
          <div className="admin-card__body" style={{ padding: 0 }}>
            {stats.recentInfo.length > 0 ? (
              <ul className="admin-recent-list">
                {stats.recentInfo.map((info) => (
                  <li key={info._id} className="admin-recent-item">
                    <div 
                      className="admin-recent-item__avatar" 
                      style={{ 
                        borderRadius: '6px', 
                        backgroundColor: 'var(--bg-card)', 
                        padding: '4px' 
                      }}
                    >
                      <i 
                        className={`fa-solid ${
                          info.type === 'loker' ? 'fa-briefcase' :
                          info.type === 'umkm' ? 'fa-store' :
                          info.type === 'kegiatan' ? 'fa-calendar-days' :
                          'fa-bullhorn'
                        }`} 
                        style={{ color: 'var(--accent)' }} 
                      />
                    </div>
                    <div className="admin-recent-item__content">
                      <div className="admin-recent-item__title">{info.title}</div>
                      <div className="admin-recent-item__desc">Kategori: {info.badge} &bull; {info.date}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="admin-empty-state">
                <p>Belum ada konten diterbitkan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
