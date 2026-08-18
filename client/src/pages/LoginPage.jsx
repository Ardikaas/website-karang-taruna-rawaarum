import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO';

import { getDashboardRouteByRole } from '../constants/roles';

const LoginPage = () => {
  const { login, user, isAuthenticated, loading } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const route = getDashboardRouteByRole(user?.role);
      navigate(route, { replace: true });
    }
  }, [isAuthenticated, loading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      showError('Harap isi username dan password Anda.', 'Form Tidak Lengkap');
      return;
    }

    setSubmitting(true);

    try {
      const loggedInUser = await login(form.username, form.password);
      showSuccess('Login berhasil! Selamat datang kembali.', 'Berhasil Masuk');
      const route = getDashboardRouteByRole(loggedInUser?.role || user?.role);
      navigate(route, { replace: true });
    } catch (err) {
      showError(
        err?.message ||
          'Login gagal. Periksa kembali username dan password Anda.',
        'Login Gagal'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="auth-page-container">
      <SEO
        title="Masuk Portal Pengurus"
        description="Portal autentikasi pengurus dan administrator Karang Taruna Kelurahan Rawa Arum."
        noIndex={true}
      />
      {/* Background decoration */}
      <div className="auth-bg-shapes">
        <div className="auth-bg-circle auth-bg-circle--1" />
        <div className="auth-bg-circle auth-bg-circle--2" />
        <div className="auth-bg-circle auth-bg-circle--3" />
      </div>

      <div className="auth-card">
        {/* Header Branding */}
        <div className="auth-card__header">
          <Link to="/" className="auth-brand-logo">
            <img
              src="/assets/karang-taruna-seeklogo.png"
              alt="Logo Karang Taruna"
              className="auth-logo-img"
            />
            <div className="auth-brand-text">
              <span className="auth-brand-title">KARANG TARUNA</span>
              <span className="auth-brand-subtitle">RAWA ARUM</span>
            </div>
          </Link>
          <h1 className="auth-card__title">Selamat Datang Kembali</h1>
          <p className="auth-card__subtitle">
            Masuk untuk mengakses layanan portal Karang Taruna Kelurahan Rawa
            Arum.
          </p>
        </div>

        {/* Auth Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            <i className="fa-solid fa-right-to-bracket" /> Masuk
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('register');
              showError(
                'Fitur pendaftaran akun pengunjung baru akan segera dibuka!',
                'Info Registrasi'
              );
            }}
          >
            <i className="fa-solid fa-user-plus" /> Daftar Akun{' '}
            <span className="auth-tab-badge">Segera</span>
          </button>
        </div>

        {activeTab === 'login' ? (
          /* Login Form */
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="auth-username">
                <i className="fa-solid fa-user" /> Username / Email
              </label>
              <input
                id="auth-username"
                type="text"
                className="admin-form-control"
                placeholder="Masukkan username atau email Anda..."
                required
                autoComplete="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.35rem',
                }}
              >
                <label
                  className="admin-form-label"
                  htmlFor="auth-password"
                  style={{ marginBottom: 0 }}
                >
                  <i className="fa-solid fa-lock" /> Password
                </label>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                  onClick={() =>
                    showError(
                      'Silakan hubungi sekretariat Karang Taruna Rawa Arum untuk reset password.',
                      'Lupa Password'
                    )
                  }
                >
                  Lupa Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  className="admin-form-control"
                  placeholder="Masukkan password Anda..."
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  <i
                    className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                  />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn--primary admin-btn--full"
              style={{
                marginTop: '0.75rem',
                height: '44px',
                fontSize: '0.9rem',
                fontWeight: '700',
              }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" /> Memverifikasi...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket" /> Masuk Sekarang
                </>
              )}
            </button>
          </form>
        ) : (
          /* Upcoming Register Info */
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(249, 115, 22, 0.1)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '1.5rem',
              }}
            >
              <i className="fa-solid fa-user-plus" />
            </div>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: '800',
                color: 'var(--primary-deep)',
                marginBottom: '0.5rem',
              }}
            >
              Pendaftaran Akun Baru
            </h3>
            <p
              style={{
                fontSize: '0.85rem',
                color: '#64748b',
                lineHeight: '1.5',
                maxWidth: '320px',
                margin: '0 auto 1.25rem',
              }}
            >
              Fitur pendaftaran akun untuk warga dan pengunjung Karang Taruna
              Rawa Arum akan segera diluncurkan!
            </p>
            <button
              type="button"
              className="admin-btn admin-btn--outline"
              onClick={() => setActiveTab('login')}
            >
              <i className="fa-solid fa-arrow-left" /> Kembali ke Form Masuk
            </button>
          </div>
        )}

        <div className="auth-card__footer">
          <Link to="/" className="auth-back-home">
            <i className="fa-solid fa-arrow-left" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
