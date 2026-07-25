import React, { useState } from 'react';

const ToastItem = ({ toast, onRemove }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fullText = toast.fullError || toast.message || '';
  const isLong = fullText.length > 110;
  const previewText =
    isLong && !expanded ? fullText.slice(0, 110) + '...' : fullText;

  const handleCopy = (e) => {
    e.stopPropagation();
    // Copy 100% of the full untruncated error message
    navigator.clipboard
      .writeText(fullText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Fallback silently if clipboard permissions blocked
      });
  };

  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <div className={`toast-popup-item ${toast.type}`}>
      <div className="toast-popup-header">
        <div className="toast-popup-title-wrapper">
          <i
            className={
              isError
                ? 'fa-solid fa-circle-exclamation toast-popup-icon-err'
                : isWarning
                  ? 'fa-solid fa-triangle-exclamation toast-popup-icon-warn'
                  : 'fa-solid fa-circle-check toast-popup-icon-succ'
            }
          />
          <span className="toast-popup-title">{toast.title}</span>
        </div>

        <div className="toast-popup-actions">
          <button
            type="button"
            className={`toast-popup-copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Salin semua pesan lengkap (tanpa terpotong)"
          >
            <i
              className={copied ? 'fa-solid fa-check' : 'fa-regular fa-copy'}
            />
            <span>
              {copied ? 'Tersalin!' : isError ? 'Salin Error' : 'Salin Pesan'}
            </span>
          </button>

          <button
            type="button"
            className="toast-popup-close-btn"
            onClick={() => onRemove(toast.id)}
            title="Tutup"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      </div>

      <div className="toast-popup-body">
        <p className="toast-popup-message">{previewText}</p>

        {isLong && (
          <button
            type="button"
            className="toast-popup-expand-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▲ Sembunyikan Ringkasan' : '▼ Lihat Detail Lengkap'}
          </button>
        )}
      </div>
    </div>
  );
};

const ToastContainer = ({ toasts = [], onRemove }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-popup-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default ToastContainer;
