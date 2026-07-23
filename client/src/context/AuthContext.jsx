import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { verifyAdminToken, adminLogin as apiAdminLogin } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, verify if there's a stored token
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const adminData = await verifyAdminToken();
        setAdmin(adminData);
      } catch {
        localStorage.removeItem('admin_token');
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  const login = useCallback(async (username, password) => {
    const { token, admin: adminData } = await apiAdminLogin(username, password);
    localStorage.setItem('admin_token', token);
    setAdmin(adminData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
