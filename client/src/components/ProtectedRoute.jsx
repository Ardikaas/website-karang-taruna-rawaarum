import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardRouteByRole } from '../constants/roles';

/**
 * Wraps admin/pengurus routes — redirects to /login if not authenticated.
 * Optionally checks allowedRoles and redirects unauthorized users to their proper role dashboard.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg-main)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <i
            className="fa-solid fa-spinner fa-spin"
            style={{ fontSize: '2rem', color: 'var(--accent)' }}
          />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            Memverifikasi sesi...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const userRole = user?.role || 'user';
    if (!allowedRoles.includes(userRole)) {
      const fallbackRoute = getDashboardRouteByRole(userRole);
      return <Navigate to={fallbackRoute} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
