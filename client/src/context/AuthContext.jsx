import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  verifyAdminToken,
  adminLogin as apiAdminLogin,
  apiLogout,
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, verify if there's a stored token
  useEffect(() => {
    const checkToken = async () => {
      const token =
        localStorage.getItem('access_token') ||
        localStorage.getItem('admin_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await verifyAdminToken();
        setUser(userData);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  const login = useCallback(async (username, password) => {
    const {
      accessToken,
      token,
      user: userData,
    } = await apiAdminLogin(username, password);
    if (accessToken) localStorage.setItem('access_token', accessToken);
    if (token) localStorage.setItem('admin_token', token);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
