import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RegistrationModal from './components/RegistrationModal';
import Toast from './components/Toast';

// Pages
import Home from './pages/Home';
import LokerPage from './pages/LokerPage';
import KegiatanPage from './pages/KegiatanPage';
import PengumumanPage from './pages/PengumumanPage';
import UmkmPage from './pages/UmkmPage';
import AdminPage from './pages/AdminPage';
import StrukturPage from './pages/StrukturPage';
import KemitraanPage from './pages/KemitraanPage';
import KontakPage from './pages/KontakPage';

// API Service
import { submitRegistration, subscribeNewsletter } from './services/api';

const SCROLL_THRESHOLD = 50;
const TOAST_DURATION_MS = 4000;
const HOME_SECTIONS = ['home', 'pilar', 'program', 'kemitraan', 'kontak'];

const App = () => {
  // --------------- Global UI State ---------------
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [regModalOpen, setRegModalOpen] = useState(false);

  // --------------- Toast ---------------
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  const showToastMessage = (message, type = 'success') => {
    setToast({ open: true, message, type });
    setTimeout(() => {
      setToast({ open: false, message: '', type: 'success' });
    }, TOAST_DURATION_MS);
  };

  // --------------- Registration Form ---------------
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'Sosial & Keagamaan',
    reason: '',
  });
  const [regSubmitting, setRegSubmitting] = useState(false);

  // --------------- Newsletter ---------------
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  // --------------- Scroll Spy ---------------
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);

      if (window.location.pathname === '/') {
        let current = 'home';
        for (const sectionId of HOME_SECTIONS) {
          const el = document.getElementById(sectionId);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 120 && rect.bottom >= 120) {
              current = sectionId;
              break;
            }
          }
        }
        setActiveSection(current);
      } else {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --------------- Form Handlers ---------------
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegSubmitting(true);

    try {
      await submitRegistration(regForm);
      showToastMessage('Pendaftaran Anda berhasil dikirim! Kami akan menghubungi Anda segera.');
      setRegForm({ name: '', email: '', phone: '', interest: 'Sosial & Keagamaan', reason: '' });
      setRegModalOpen(false);
    } catch (err) {
      showToastMessage(err.message || 'Gagal mengirim pendaftaran. Server kemungkinan offline.', 'error');
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubmitting(true);

    try {
      await subscribeNewsletter(newsletterEmail);
      showToastMessage('Email Anda berhasil didaftarkan di newsletter!');
      setNewsletterEmail('');
    } catch (err) {
      showToastMessage(err.message || 'Gagal mendaftar newsletter.', 'error');
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  // --------------- Render ---------------
  return (
    <>
      <Navbar
        activeSection={activeSection}
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenRegModal={() => setRegModalOpen(true)}
      />

      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/loker" element={<LokerPage />} />
          <Route path="/kegiatan" element={<KegiatanPage />} />
          <Route path="/pengumuman" element={<PengumumanPage />} />
          <Route path="/umkm" element={<UmkmPage />} />
          <Route path="/struktur" element={<StrukturPage />} />
          <Route path="/kemitraan" element={<KemitraanPage />} />
          <Route path="/kontak" element={<KontakPage />} />
          <Route path="/admin" element={<AdminPage showToastMessage={showToastMessage} />} />
        </Routes>
      </main>

      <Footer
        newsletterEmail={newsletterEmail}
        setNewsletterEmail={setNewsletterEmail}
        onNewsletterSubmit={handleNewsletterSubmit}
        newsletterSubmitting={newsletterSubmitting}
      />

      <RegistrationModal
        isOpen={regModalOpen}
        onClose={() => setRegModalOpen(false)}
        regForm={regForm}
        setRegForm={setRegForm}
        onSubmit={handleRegisterSubmit}
        submitting={regSubmitting}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
      />
    </>
  );
};

export default App;
