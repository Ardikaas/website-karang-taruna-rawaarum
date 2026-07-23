import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLoginPage = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(form.username, form.password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali username dan password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="admin-login-page">
      {/* Background decoration */}
      <div className="admin-login-bg">
        <div className="admin-login-bg__circle admin-login-bg__circle--1" />
        <div className="admin-login-bg__circle admin-login-bg__circle--2" />
        <div className="admin-login-bg__circle admin-login-bg__circle--3" />
      </div>

      <div className="admin-login-card">
        {/* Header */}
        <div className="admin-login-card__header">
          <div className="admin-login-card__icon">
            <i className="fa-solid fa-shield-halved" />
          </div>
          <h1 className="admin-login-card__title">Portal Admin</h1>
          <p className="admin-login-card__subtitle">
            Karang Taruna Kelurahan Rawa Arum
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="admin-login-card__form">
          {error && (
            <div className="admin-alert admin-alert--error">
              <i className="fa-solid fa-circle-exclamation" />
              <span>{error}</span>
            </div>
          )}

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="login-username">
              <i className="fa-solid fa-user" /> Username
            </label>
            <input
              id="login-username"
              type="text"
              className="admin-form-control"
              placeholder="Masukkan username..."
              required
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="login-password">
              <i className="fa-solid fa-lock" /> Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="admin-form-control"
                placeholder="Masukkan password..."
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn--primary admin-btn--full"
            disabled={submitting}
          >
            {submitting ? (
              <><i className="fa-solid fa-spinner fa-spin" /> Memverifikasi...</>
            ) : (
              <><i className="fa-solid fa-right-to-bracket" /> Masuk ke Dashboard</>
            )}
          </button>
        </form>

        <div className="admin-login-card__hint">
          <i className="fa-solid fa-circle-info" />
          <span>Akses khusus pengurus Karang Taruna Rawa Arum</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
