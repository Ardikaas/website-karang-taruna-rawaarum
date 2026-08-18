import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MASTER_DEV_PASSCODE = 'KTTUNAS-DEV-2026';
const MAX_ATTEMPTS = 5;

const DevPasscodeModal = ({ onUnlocked }) => {
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLocked) return;

    if (passcode.trim() === MASTER_DEV_PASSCODE) {
      sessionStorage.setItem('dev_console_unlocked', 'true');
      if (onUnlocked) onUnlocked();
    } else {
      const nextAttempts = attemptsLeft - 1;
      setAttemptsLeft(nextAttempts);
      setPasscode('');

      if (nextAttempts <= 0) {
        setIsLocked(true);
        setErrorMessage(
          'Akses dikunci karena terlalu banyak percobaan salah. Silakan coba lagi nanti.'
        );
      } else {
        setErrorMessage(
          `Passcode developer salah! Sisa percobaan: ${nextAttempts}`
        );
      }
    }
  };

  return (
    <div className="dev-auth-backdrop">
      <div className="dev-auth-card">
        <div className="dev-auth-header">
          <div className="dev-auth-icon">
            <i className="fa-solid fa-terminal" />
          </div>
          <div className="dev-auth-badge">
            <i className="fa-solid fa-lock" /> SUPERADMIN SECURITY LEVEL 2
          </div>
          <h2 className="dev-auth-title">Developer Console Challenge</h2>
          <p className="dev-auth-subtitle">
            Halaman ini berada di bawah pengawasan sistem. Masukkan{' '}
            <strong>Master Developer Passcode</strong> untuk membuka akses
            telemetri dan konsol internal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="dev-auth-form">
          <div className="dev-auth-input-group">
            <label htmlFor="dev-passcode-input" className="dev-auth-label">
              <i className="fa-solid fa-key" /> Master Security Passcode:
            </label>
            <div className="dev-auth-input-wrapper">
              <input
                id="dev-passcode-input"
                type="password"
                className="dev-auth-input"
                placeholder="Masukkan Passcode Developer..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                disabled={isLocked}
                autoFocus
              />
            </div>
          </div>

          {errorMessage && (
            <div className="dev-auth-error">
              <i className="fa-solid fa-triangle-exclamation" /> {errorMessage}
            </div>
          )}

          <div className="dev-auth-actions">
            <button
              type="submit"
              className="dev-auth-submit-btn"
              disabled={isLocked || !passcode.trim()}
            >
              <i className="fa-solid fa-unlock-keyhole" /> Buka Akses Konsol
            </button>
            <button
              type="button"
              className="dev-auth-cancel-btn"
              onClick={() => navigate('/admin/dashboard')}
            >
              <i className="fa-solid fa-arrow-left" /> Kembali ke Dashboard
            </button>
          </div>
        </form>

        <div className="dev-auth-footer">
          <button
            type="button"
            className="dev-auth-hint-toggle"
            onClick={() => setShowHint(!showHint)}
          >
            <i className="fa-regular fa-circle-question" />{' '}
            {showHint ? 'Sembunyikan Petunjuk' : 'Petunjuk Passcode Default'}
          </button>
          {showHint && (
            <div className="dev-auth-hint-box">
              <code>KTTUNAS-DEV-2026</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevPasscodeModal;
