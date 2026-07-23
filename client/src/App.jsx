import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';

// Pages
import Home from './pages/Home';
import LokerPage from './pages/LokerPage';
import KegiatanPage from './pages/KegiatanPage';
import PengumumanPage from './pages/PengumumanPage';
import UmkmPage from './pages/UmkmPage';
import StrukturPage from './pages/StrukturPage';
import KemitraanPage from './pages/KemitraanPage';
import KontakPage from './pages/KontakPage';
import ProgramPage from './pages/ProgramPage';

// Admin Pages & Layout
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminKontenPage from './pages/admin/AdminKontenPage';
import AdminSubscriberPage from './pages/admin/AdminSubscriberPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminPengurusPage from './pages/admin/AdminPengurusPage';
import AdminProgramPage from './pages/admin/AdminProgramPage';
import AdminPartnerPage from './pages/admin/AdminPartnerPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import { AuthProvider } from './context/AuthContext';

// API Service
import { subscribeNewsletter } from './services/api';

const SCROLL_THRESHOLD = 50;
const TOAST_DURATION_MS = 4000;
const HOME_SECTIONS = ['home', 'pilar', 'program', 'kemitraan', 'kontak'];

const App = () => {
  // --------------- Global UI State ---------------
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --------------- Toast ---------------
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  const showToastMessage = (message, type = 'success') => {
    setToast({ open: true, message, type });
    setTimeout(() => {
      setToast({ open: false, message: '', type: 'success' });
    }, TOAST_DURATION_MS);
  };

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
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      {!isAdminPath && (
        <Navbar
          activeSection={activeSection}
          scrolled={scrolled}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      )}

      <main style={{ minHeight: isAdminPath ? '100vh' : '80vh' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/program" element={<ProgramPage />} />
          <Route path="/loker" element={<LokerPage />} />
          <Route path="/kegiatan" element={<KegiatanPage />} />
          <Route path="/pengumuman" element={<PengumumanPage />} />
          <Route path="/umkm" element={<UmkmPage />} />
          <Route path="/struktur" element={<StrukturPage />} />
          <Route path="/kemitraan" element={<KemitraanPage />} />
          <Route path="/kontak" element={<KontakPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/konten" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminKontenPage />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/subscriber" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminSubscriberPage />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminSettingsPage />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/pengurus" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminPengurusPage />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/program" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminProgramPage />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/kemitraan" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminPartnerPage />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>

      {!isAdminPath && (
        <Footer
          newsletterEmail={newsletterEmail}
          setNewsletterEmail={setNewsletterEmail}
          onNewsletterSubmit={handleNewsletterSubmit}
          newsletterSubmitting={newsletterSubmitting}
        />
      )}

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
      />
    </AuthProvider>
  );
};

export default App;
