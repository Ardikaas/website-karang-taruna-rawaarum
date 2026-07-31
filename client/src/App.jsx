import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RegistrationModal from './components/RegistrationModal';

// Context
import { useToast } from './context/ToastContext';

// Pages
import Home from './pages/Home';
import LokerPage from './pages/LokerPage';
import KegiatanPage from './pages/KegiatanPage';
import PengumumanPage from './pages/PengumumanPage';
import UmkmPage from './pages/UmkmPage';
import UmkmDetailPage from './pages/UmkmDetailPage';
import StrukturPage from './pages/StrukturPage';
import KemitraanPage from './pages/KemitraanPage';
import KontakPage from './pages/KontakPage';
import ProgramPage from './pages/ProgramPage';
import LoginPage from './pages/LoginPage';
import InfoDetailPage from './pages/InfoDetailPage';
import PengurusProfilePage from './pages/pengurus/PengurusProfilePage';

// Admin Pages & Layout
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminKontenPage from './pages/admin/AdminKontenPage';
import AdminUmkmPage from './pages/admin/AdminUmkmPage';
import AdminAnggotaPage from './pages/admin/AdminAnggotaPage';
import AdminSubscriberPage from './pages/admin/AdminSubscriberPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminPengurusPage from './pages/admin/AdminPengurusPage';
import AdminProgramPage from './pages/admin/AdminProgramPage';
import AdminPartnerPage from './pages/admin/AdminPartnerPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import { AuthProvider } from './context/AuthContext';

// API Service
import { submitRegistration, subscribeNewsletter } from './services/api';

const SCROLL_THRESHOLD = 50;
const HOME_SECTIONS = ['home', 'pilar', 'program', 'kemitraan', 'kontak'];

const App = () => {
  // --------------- Global UI State ---------------
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [regModalOpen, setRegModalOpen] = useState(false);

  // --------------- Registration Form ---------------
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'Sosial & Keagamaan',
    reason: '',
  });
  const [regSubmitting, setRegSubmitting] = useState(false);

  // --------------- Toast Context ---------------
  const { showSuccess, showError } = useToast();

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
      showSuccess(
        'Pendaftaran Anda berhasil dikirim! Kami akan menghubungi Anda segera.'
      );
      setRegForm({
        name: '',
        email: '',
        phone: '',
        interest: 'Sosial & Keagamaan',
        reason: '',
      });
      setRegModalOpen(false);
    } catch (err) {
      showError(err, 'Gagal Mengirim Pendaftaran');
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
      showSuccess('Email Anda berhasil didaftarkan di newsletter!');
      setNewsletterEmail('');
    } catch (err) {
      showError(err, 'Gagal Langganan Newsletter');
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  // --------------- Render ---------------
  const location = useLocation();
  const isDashboardOrAuthPath =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/pengurus') ||
    location.pathname.startsWith('/login');

  return (
    <AuthProvider>
      {!isDashboardOrAuthPath && (
        <Navbar
          activeSection={activeSection}
          scrolled={scrolled}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onOpenRegModal={() => setRegModalOpen(true)}
        />
      )}

      <main style={{ minHeight: isDashboardOrAuthPath ? '100vh' : '80vh' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/program" element={<ProgramPage />} />
          <Route path="/loker" element={<LokerPage />} />
          <Route path="/kegiatan" element={<KegiatanPage />} />
          <Route path="/pengumuman" element={<PengumumanPage />} />
          <Route path="/umkm" element={<UmkmPage />} />
          <Route path="/umkm/:id" element={<UmkmDetailPage />} />
          <Route path="/umkm/:slug/:id" element={<UmkmDetailPage />} />
          <Route path="/informasi/:id" element={<InfoDetailPage />} />
          <Route path="/info/:id" element={<InfoDetailPage />} />
          <Route path="/struktur" element={<StrukturPage />} />
          <Route path="/kemitraan" element={<KemitraanPage />} />
          <Route path="/kontak" element={<KontakPage />} />

          {/* Auth & Pengurus Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/pengurus"
            element={<Navigate to="/pengurus/profile" replace />}
          />
          <Route
            path="/pengurus/dashboard"
            element={<Navigate to="/pengurus/profile" replace />}
          />
          <Route
            path="/pengurus/profile"
            element={
              <ProtectedRoute
                allowedRoles={['superadmin', 'admin', 'pengurus']}
              >
                <AdminLayout>
                  <PengurusProfilePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengurus/konten"
            element={
              <ProtectedRoute
                allowedRoles={['superadmin', 'admin', 'pengurus']}
              >
                <AdminLayout>
                  <AdminKontenPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengurus/umkm"
            element={
              <ProtectedRoute
                allowedRoles={['superadmin', 'admin', 'pengurus']}
              >
                <AdminLayout>
                  <AdminUmkmPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/konten"
            element={
              <ProtectedRoute
                allowedRoles={['superadmin', 'admin', 'pengurus']}
              >
                <AdminLayout>
                  <AdminKontenPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/umkm"
            element={
              <ProtectedRoute
                allowedRoles={['superadmin', 'admin', 'pengurus']}
              >
                <AdminLayout>
                  <AdminUmkmPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/anggota"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <AdminLayout>
                  <AdminAnggotaPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscriber"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <AdminLayout>
                  <AdminSubscriberPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <AdminLayout>
                  <AdminSettingsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pengurus"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <AdminLayout>
                  <AdminPengurusPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/program"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <AdminLayout>
                  <AdminProgramPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/kemitraan"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <AdminLayout>
                  <AdminPartnerPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {!isDashboardOrAuthPath && (
        <Footer
          newsletterEmail={newsletterEmail}
          setNewsletterEmail={setNewsletterEmail}
          onNewsletterSubmit={handleNewsletterSubmit}
          newsletterSubmitting={newsletterSubmitting}
        />
      )}
      <RegistrationModal
        isOpen={regModalOpen}
        onClose={() => setRegModalOpen(false)}
        regForm={regForm}
        setRegForm={setRegForm}
        onSubmit={handleRegisterSubmit}
        submitting={regSubmitting}
      />
    </AuthProvider>
  );
};

export default App;
