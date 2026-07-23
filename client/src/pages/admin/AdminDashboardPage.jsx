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
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <i className="fa-solid fa-newspaper" />
          </div>
          <div>
            <div className="admin-stat-card__label">Total Konten / Info</div>
            <div className="admin-stat-card__value">{stats.totalInfo}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <i className="fa-solid fa-briefcase" />
          </div>
          <div>
            <div className="admin-stat-card__label">Program Kerja</div>
            <div className="admin-stat-card__value">{stats.totalProgram}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <i className="fa-solid fa-handshake" />
          </div>
          <div>
            <div className="admin-stat-card__label">Mitra & Sponsorship</div>
            <div className="admin-stat-card__value">{stats.totalPartner}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <i className="fa-solid fa-envelope-open-text" />
          </div>
          <div>
            <div className="admin-stat-card__label">Subscribers</div>
            <div className="admin-stat-card__value">{stats.totalSubscriber}</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Recent Activity */}
      <div className="admin-activity-grid">
        {/* Left Column: Recent Subscribers */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">
              <i className="fa-solid fa-user-plus" /> Subscriber Terbaru
            </h2>
            <Link to="/admin/subscriber" className="admin-card__header-link">
              Lihat Semua
            </Link>
          </div>
          <div className="admin-card__body" style={{ padding: 0 }}>
            {stats.recentSubscribers && stats.recentSubscribers.length > 0 ? (
              <ul className="admin-recent-list">
                {stats.recentSubscribers.map((m) => (
                  <li key={m._id} className="admin-recent-item" style={{ padding: '1rem 1.25rem' }}>
                    <div className="admin-recent-item__avatar" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                      <i className="fa-solid fa-envelope" />
                    </div>
                    <div className="admin-recent-item__content">
                      <div className="admin-recent-item__title" style={{ fontWeight: '600' }}>{m.email}</div>
                      <div className="admin-recent-item__desc">
                        Didaftar pada: {m.createdAt ? new Date(m.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="admin-empty-state" style={{ padding: '3rem 1.5rem' }}>
                <p>Belum ada subscriber baru.</p>
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
