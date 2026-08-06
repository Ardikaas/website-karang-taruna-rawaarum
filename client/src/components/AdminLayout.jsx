import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleConfig } from '../constants/roles';

const ALL_NAV_ITEMS = [
  {
    to: '/admin/dashboard',
    icon: 'fa-gauge-high',
    label: 'Dashboard',
    roles: ['superadmin', 'admin'],
  },
  {
    to: '/admin/profile',
    icon: 'fa-user-gear',
    label: 'Profile',
    roles: ['pengurus'],
  },
  {
    to: '/admin/konten',
    icon: 'fa-newspaper',
    label: 'Konten',
    roles: ['superadmin', 'admin', 'pengurus'],
  },
  {
    to: '/admin/umkm',
    icon: 'fa-store',
    label: 'UMKM Binaan',
    roles: ['superadmin', 'admin', 'pengurus'],
  },
  {
    to: '/admin/program',
    icon: 'fa-briefcase',
    label: 'Program',
    roles: ['superadmin', 'admin'],
  },
  {
    to: '/admin/kemitraan',
    icon: 'fa-handshake',
    label: 'Kemitraan',
    roles: ['superadmin', 'admin'],
  },
  {
    to: '/admin/keuangan',
    icon: 'fa-wallet',
    label: 'Keuangan Kas',
    roles: ['superadmin', 'admin', 'pengurus'],
  },
  /*
  {
    to: '/admin/anggota',
    icon: 'fa-users',
    label: 'Anggota',
    roles: ['superadmin', 'admin'],
  },
  {
    to: '/admin/subscriber',
    icon: 'fa-envelope-open-text',
    label: 'Subscriber',
    roles: ['superadmin', 'admin'],
  },
  */
  {
    to: '/admin/pesan',
    icon: 'fa-inbox',
    label: 'Pesan Masuk',
    roles: ['superadmin', 'admin', 'pengurus'],
  },
  {
    to: '/admin/pengurus',
    icon: 'fa-sitemap',
    label: 'Pengurus',
    roles: ['superadmin', 'admin'],
  },
  {
    to: '/admin/settings',
    icon: 'fa-gear',
    label: 'Pengaturan',
    roles: ['superadmin', 'admin'],
  },
];

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const roleConfig = getRoleConfig(user?.role);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filter sidebar items based on role & replace prefix if pengurus
  const userRole = user?.role || 'admin';
  const prefix = userRole === 'pengurus' ? '/pengurus' : '/admin';

  const navItems = ALL_NAV_ITEMS.filter((item) =>
    item.roles.includes(userRole)
  ).map((item) => ({
    ...item,
    to: item.to.replace('/admin', prefix),
  }));

  return (
    <div className="admin-shell">
      {/* ── Mobile Header Topbar ── */}
      <header className="admin-mobile-topbar">
        <div className="admin-mobile-topbar__brand">
          <i className="fa-solid fa-shield-halved admin-mobile-topbar__logo" />
          <span className="admin-mobile-topbar__title">
            {user?.role === 'pengurus' ? 'Portal Pengurus' : 'Admin Panel'}
          </span>
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
          <Link
            to="/"
            className="admin-sidebar__logo"
            title="Kembali ke Beranda Utama"
            style={{ textDecoration: 'none' }}
          >
            <i className="fa-solid fa-shield-halved" />
          </Link>
          <div>
            <div className="admin-sidebar__brand-name">
              {user?.role === 'pengurus' ? 'Portal Pengurus' : 'Admin Panel'}
            </div>
            <div className="admin-sidebar__brand-sub">Karang Taruna</div>
          </div>
          <button
            type="button"
            className="admin-sidebar__close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup Sidebar"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          <p className="admin-sidebar__section-label">Menu Utama</p>
          {navItems.map(({ to, icon, label }) => (
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
            Akses Website
          </p>
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="admin-sidebar__link"
            style={{ color: 'var(--accent)' }}
          >
            <i
              className="fa-solid fa-house admin-sidebar__link-icon"
              style={{ color: 'var(--accent)' }}
            />
            <span>Ke Beranda Utama</span>
          </Link>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div
              className="admin-sidebar__avatar"
              style={{ overflow: 'hidden' }}
            >
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.name || 'User'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                user?.name?.[0]?.toUpperCase() ||
                user?.username?.[0]?.toUpperCase() ||
                'A'
              )}
            </div>
            <div className="admin-sidebar__user-info">
              <div className="admin-sidebar__user-name">
                {user?.name || user?.username || 'Admin'}
              </div>
              <div className="admin-sidebar__user-role">{roleConfig.label}</div>
            </div>
          </div>
          <button
            className="admin-sidebar__logout-btn"
            onClick={handleLogout}
            title="Logout"
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

export default AdminLayout;
