import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSiteSettings } from '../services/api';

const Footer = ({ 
  newsletterEmail, 
  setNewsletterEmail, 
  onNewsletterSubmit, 
  newsletterSubmitting
}) => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchSiteSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);

  const address = settings?.address || 'Jl. Rawa Arum No. 12, Kec. Grogol, Kota Cilegon, Banten 42436';
  const phone = settings?.phone || '0812-3456-7890';
  const email = settings?.email || 'kontak@karangtarunarawaarum.id';
  const ig = settings?.socialInstagram || 'https://instagram.com';
  const fb = settings?.socialFacebook || 'https://facebook.com';
  const yt = settings?.socialYoutube || 'https://youtube.com';

  return (
    <footer className="footer-section" id="kontak">
      <div className="container footer-grid">
        {/* About */}
        <div className="footer-col">
          <Link to="/" className="logo-brand footer-logo">
            <img src="/assets/karang-taruna-seeklogo.png" alt="Logo Karang Taruna" className="logo-img" />
            <div className="logo-text">
              <span className="logo-title text-light">KARANG TARUNA</span>
              <span className="logo-subtitle text-accent">RAWA ARUM</span>
            </div>
          </Link>
          <p className="footer-desc">
            Bersama pemuda-pemudi potensial kelurahan Rawa Arum, kita kembangkan kebersamaan, kepedulian sosial, serta kontribusi aktif membangun daerah.
          </p>
          <div className="social-links">
            <a href={ig} target="_blank" rel="noopener noreferrer" className="social-icon"><i className="fa-brands fa-instagram"></i></a>
            <a href={fb} target="_blank" rel="noopener noreferrer" className="social-icon"><i className="fa-brands fa-facebook-f"></i></a>
            <a href={yt} target="_blank" rel="noopener noreferrer" className="social-icon"><i className="fa-brands fa-youtube"></i></a>
          </div>
        </div>

        {/* Quick Menu */}
        <div className="footer-col">
          <h4 className="footer-title">Menu Cepat</h4>
          <ul className="footer-menu">
            <li><a href="/#home">Beranda</a></li>
            <li><a href="/#pilar">Profil</a></li>
            <li><Link to="/program">Program Kerja</Link></li>
            <li><Link to="/kegiatan">Berita & Kegiatan</Link></li>
            <li><Link to="/loker">Lowongan Kerja</Link></li>
            <li><Link to="/umkm">Katalog UMKM</Link></li>
          </ul>
        </div>

        {/* Contact Details */}
        <div className="footer-col">
          <h4 className="footer-title">Kontak Resmi</h4>
          <ul className="contact-list">
            <li>
              <i className="fa-solid fa-location-dot contact-icon"></i>
              <span>{address}</span>
            </li>
            <li>
              <i className="fa-solid fa-phone contact-icon"></i>
              <a href={`tel:${phone.replace(/[^0-9]/g, '')}`}>{phone}</a>
            </li>
            <li>
              <i className="fa-solid fa-envelope contact-icon"></i>
              <a href={`mailto:${email}`}>{email}</a>
            </li>
          </ul>
        </div>

        {/* Newsletter Subscribe */}
        <div className="footer-col">
          <h4 className="footer-title">Newsletter</h4>
          <p className="newsletter-desc">Dapatkan notifikasi berita kegiatan dan info loker gratis langsung ke email Anda.</p>
          <form className="newsletter-form" onSubmit={onNewsletterSubmit}>
            <input 
              type="email" 
              placeholder="Alamat email Anda..." 
              required 
              className="newsletter-input"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
            />
            <button type="submit" className="newsletter-btn" disabled={newsletterSubmitting}>
              {newsletterSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p className="copyright-text">&copy; 2026 Karang Taruna Rawa Arum. All rights reserved.</p>
          <div className="bottom-links">
            <Link to="/">Kebijakan Privasi</Link>
            <Link to="/">Syarat & Ketentuan</Link>
            <Link to="/admin"><i className="fa-solid fa-lock" style={{ fontSize: '0.65rem', marginRight: '4px' }}></i> Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
