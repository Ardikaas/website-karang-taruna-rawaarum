import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: 'fa-gauge-high',    label: 'Dashboard'   },
  { to: '/admin/konten',    icon: 'fa-newspaper',      label: 'Konten'      },
  { to: '/admin/program',   icon: 'fa-briefcase',      label: 'Program'     },
  { to: '/admin/kemitraan', icon: 'fa-handshake',      label: 'Kemitraan'   },
  { to: '/admin/subscriber',icon: 'fa-envelope-open-text', label: 'Subscriber' },
  { to: '/admin/pengurus',  icon: 'fa-sitemap',        label: 'Pengurus'    },
  { to: '/admin/settings',  icon: 'fa-gear',           label: 'Pengaturan'  },
];

const AdminLayout = ({ children }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo">
            <i className="fa-solid fa-shield-halved" />
          </div>
          <div>
            <div className="admin-sidebar__brand-name">Admin Panel</div>
            <div className="admin-sidebar__brand-sub">Karang Taruna</div>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          <p className="admin-sidebar__section-label">Menu Utama</p>
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
              }
            >
              <i className={`fa-solid ${icon} admin-sidebar__link-icon`} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">
              {admin?.username?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="admin-sidebar__user-info">
              <div className="admin-sidebar__user-name">{admin?.username ?? 'Admin'}</div>
              <div className="admin-sidebar__user-role">Administrator</div>
            </div>
          </div>
          <button className="admin-sidebar__logout-btn" onClick={handleLogout} title="Logout">
            <i className="fa-solid fa-right-from-bracket" />
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="admin-main">
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
