import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardRouteByRole } from '../constants/roles';

const Navbar = ({
  activeSection,
  scrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { isAuthenticated, user } = useAuth();
  const profileRoute = getDashboardRouteByRole(user?.role);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const closeAll = () => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  return (
    <>
      {mobileMenuOpen && <div className="nav-backdrop" onClick={closeAll} />}
      <header
        className={`navbar-header ${scrolled ? 'scrolled' : ''}`}
        id="header"
      >
        <div className="container navbar-container">
          <Link to="/" className="logo-brand" onClick={closeAll}>
            <img
              src="/assets/karang-taruna-seeklogo.png"
              alt="Logo Karang Taruna"
              className="logo-img"
            />
            <div className="logo-text">
              <span className="logo-title">KARANG TARUNA</span>
              <span className="logo-subtitle">RAWA ARUM</span>
            </div>
          </Link>

          {/* Nav Menu */}
          <nav className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <a
              href="/#home"
              className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
              onClick={closeAll}
            >
              Beranda
            </a>

            {/* Dropdown Profil */}
            <div
              className={`nav-dropdown ${openDropdown === 'profil' ? 'mobile-open' : ''}`}
            >
              <a
                href="/#pilar"
                className={`nav-link ${activeSection === 'pilar' ? 'active' : ''}`}
                onClick={(e) => {
                  if (mobileMenuOpen) {
                    e.preventDefault();
                    toggleDropdown('profil');
                  }
                }}
              >
                Profil{' '}
                <i
                  className="fas fa-chevron-down dropdown-icon"
                  style={{ marginLeft: '4px' }}
                />
              </a>
              <div className="dropdown-content">
                <a href="/#visi-misi" onClick={closeAll}>
                  Visi & Misi
                </a>
                <Link to="/struktur" onClick={closeAll}>
                  Struktur Organisasi
                </Link>
              </div>
            </div>

            <a
              href="/#program"
              className={`nav-link ${activeSection === 'program' ? 'active' : ''}`}
              onClick={closeAll}
            >
              Program
            </a>

            {/* Dropdown Informasi */}
            <div
              className={`nav-dropdown ${openDropdown === 'informasi' ? 'mobile-open' : ''}`}
            >
              <span
                className="nav-link"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (mobileMenuOpen) {
                    toggleDropdown('informasi');
                  }
                }}
              >
                Informasi{' '}
                <i
                  className="fas fa-chevron-down dropdown-icon"
                  style={{ marginLeft: '4px' }}
                />
              </span>
              <div className="dropdown-content">
                <Link to="/loker" onClick={closeAll}>
                  Lowongan Kerja
                </Link>
                <Link to="/kegiatan" onClick={closeAll}>
                  Berita & Kegiatan
                </Link>
                <Link to="/pengumuman" onClick={closeAll}>
                  Pengumuman Penting
                </Link>
                <Link to="/umkm" onClick={closeAll}>
                  Showcase UMKM
                </Link>
              </div>
            </div>

            <Link
              to="/kemitraan"
              className={`nav-link ${activeSection === 'kemitraan' ? 'active' : ''}`}
              onClick={closeAll}
            >
              Kemitraan
            </Link>

            <Link
              to="/kontak"
              className={`nav-link ${activeSection === 'kontak' ? 'active' : ''}`}
              onClick={closeAll}
            >
              Kontak
            </Link>
          </nav>

          {/* Actions */}
          <div className="nav-actions">
            {isAuthenticated ? (
              <Link
                to={profileRoute}
                className="user-profile-chip-nav"
                onClick={closeAll}
                title={`Profil: ${user?.name || user?.username || 'Pengurus'}`}
              >
                <div className="profile-chip-avatar">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt={user.name || 'User'} />
                  ) : (
                    <i className="fa-solid fa-user" />
                  )}
                </div>
                <span className="profile-chip-name">
                  {user?.name || user?.username || 'Pengurus'}
                </span>
              </Link>
            ) : (
              <Link to="/login" className="btn-login-nav" onClick={closeAll}>
                <i className="fa-solid fa-right-to-bracket" />
                <span>Masuk</span>
              </Link>
            )}

            <button
              className={`mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
