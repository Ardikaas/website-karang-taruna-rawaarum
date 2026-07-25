import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/ToastContainer';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      message = '',
      fullError = '',
      type = 'error',
      title = '',
      duration = 8000,
    }) => {
      const id = Date.now() + Math.random();
      const fullText = fullError || message || 'Terjadi kesalahan sistem.';
      const displayMsg = message || fullText;

      const newToast = {
        id,
        message: displayMsg,
        fullError: fullText,
        type,
        title:
          title ||
          (type === 'error'
            ? 'Pesan Error'
            : type === 'warning'
              ? 'Peringatan'
              : 'Notifikasi'),
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const showError = useCallback(
    (error, title = 'Terjadi Kesalahan') => {
      const rawText =
        typeof error === 'string'
          ? error
          : error?.response?.data?.error || error?.message || String(error);

      showToast({
        message: rawText,
        fullError: rawText,
        type: 'error',
        title,
        duration: 10000, // 10 seconds for errors
      });
    },
    [showToast]
  );

  const showSuccess = useCallback(
    (message, title = 'Berhasil') => {
      showToast({
        message,
        fullError: message,
        type: 'success',
        title,
        duration: 4000,
      });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message, title = 'Peringatan') => {
      showToast({
        message,
        fullError: message,
        type: 'warning',
        title,
        duration: 6000,
      });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, showError, showSuccess, showWarning, removeToast }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
