import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleConfig } from '../constants/roles';

// Default menu links by role
const DEFAULT_MENU_BY_ROLE = {
  pengurus: [
    { to: '/pengurus/dashboard', icon: 'fa-id-card', label: 'Profil Saya' },
    { to: '/pengurus/proker', icon: 'fa-list-check', label: 'Tugas & Proker' },
    {
      to: '/pengurus/absensi',
      icon: 'fa-calendar-check',
      label: 'Absensi Kehadiran',
    },
    {
      to: '/pengurus/laporan',
      icon: 'fa-file-lines',
      label: 'Catatan Kegiatan',
    },
  ],
  user: [
    { to: '/user/profile', icon: 'fa-user-gear', label: 'Profil Saya' },
    { to: '/user/kegiatan', icon: 'fa-calendar-days', label: 'Kegiatan Saya' },
  ],
};

const UserDashboardLayout = ({ navItems, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleConfig = getRoleConfig(user?.role);
  const menuItems =
    navItems ||
    DEFAULT_MENU_BY_ROLE[user?.role] ||
    DEFAULT_MENU_BY_ROLE.pengurus;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      {/* ── Mobile Header Topbar ── */}
      <header className="admin-mobile-topbar">
        <div className="admin-mobile-topbar__brand">
          <i className="fa-solid fa-user-gear admin-mobile-topbar__logo" />
          <span className="admin-mobile-topbar__title">Portal Pemuda</span>
        </div>
        <button
          className="admin-mobile-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Sidebar"
        >
          <i className={`fa-solid ${sidebarOpen ? 'fa-xmark' : 'fa-bars'}`} />
        </button>
      </header>

      {/* ── Backdrop Overlay ── */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo">
            <i className="fa-solid fa-user-gear" />
          </div>
          <div>
            <div className="admin-sidebar__brand-name">Portal Pemuda</div>
            <div className="admin-sidebar__brand-sub">Karang Taruna</div>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          <p className="admin-sidebar__section-label">Menu Utama</p>
          {menuItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
              }
            >
              <i className={`fa-solid ${icon} admin-sidebar__link-icon`} />
              <span>{label}</span>
            </NavLink>
          ))}

          <p
            className="admin-sidebar__section-label"
            style={{ marginTop: '1.5rem' }}
          >
            Akses Publik
          </p>
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="admin-sidebar__link"
          >
            <i className="fa-solid fa-house admin-sidebar__link-icon" />
            <span>Beranda Utama</span>
          </Link>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">
              {user?.name?.[0]?.toUpperCase() ||
                user?.username?.[0]?.toUpperCase() ||
                'P'}
            </div>
            <div className="admin-sidebar__user-info">
              <div className="admin-sidebar__user-name">
                {user?.name || user?.username || 'Pengurus'}
              </div>
              <div className="admin-sidebar__user-role">{roleConfig.label}</div>
            </div>
          </div>
          <button
            className="admin-sidebar__logout-btn"
            onClick={handleLogout}
            title="Keluar"
          >
            <i className="fa-solid fa-right-from-bracket" />
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="admin-main">
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default UserDashboardLayout;
