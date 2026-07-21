import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ activeSection, scrolled, mobileMenuOpen, setMobileMenuOpen, onOpenRegModal }) => {
  return (
    <header className={`navbar-header ${scrolled ? 'scrolled' : ''}`} id="header">
      <div className="container navbar-container">
        <Link to="/" className="logo-brand" onClick={() => setMobileMenuOpen(false)}>
          <img src="/assets/karang-taruna-seeklogo.png" alt="Logo Karang Taruna" className="logo-img" />
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
            onClick={() => setMobileMenuOpen(false)}
          >
            Beranda
          </a>
          
          {/* Dropdown Profil */}
          <div className="nav-dropdown">
            <a 
              href="/#pilar" 
              className={`nav-link ${activeSection === 'pilar' ? 'active' : ''}`}
            >
              Profil <i className="fas fa-chevron-down dropdown-icon" style={{ marginLeft: '4px' }}></i>
            </a>
            <div className="dropdown-content">
              <a href="/#visi-misi" onClick={() => setMobileMenuOpen(false)}>Visi & Misi</a>
              <Link to="/struktur" onClick={() => setMobileMenuOpen(false)}>Struktur Organisasi</Link>
            </div>
          </div>

          <a 
            href="/#program" 
            className={`nav-link ${activeSection === 'program' ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Program
          </a>

          {/* Dropdown Informasi Publik (Refactored for Multi-page routes) */}
          <div className="nav-dropdown">
            <span 
              className="nav-link" 
              style={{ cursor: 'pointer' }}
            >
              Informasi <i className="fas fa-chevron-down dropdown-icon" style={{ marginLeft: '4px' }}></i>
            </span>
            <div className="dropdown-content">
              <Link to="/loker" onClick={() => setMobileMenuOpen(false)}>Lowongan Kerja</Link>
              <Link to="/kegiatan" onClick={() => setMobileMenuOpen(false)}>Berita & Kegiatan</Link>
              <Link to="/pengumuman" onClick={() => setMobileMenuOpen(false)}>Pengumuman Penting</Link>
              <Link to="/umkm" onClick={() => setMobileMenuOpen(false)}>Showcase UMKM</Link>
            </div>
          </div>

          <Link 
            to="/kemitraan" 
            className={`nav-link ${activeSection === 'kemitraan' ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Kemitraan
          </Link>
          
          <Link 
            to="/kontak" 
            className={`nav-link ${activeSection === 'kontak' ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Kontak
          </Link>
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          <button 
            className={`mobile-toggle ${mobileMenuOpen ? 'active' : ''}`} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
