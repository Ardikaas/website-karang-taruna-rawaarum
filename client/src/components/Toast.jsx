import React from 'react';

const Toast = ({ open, message, type }) => {
  if (!open) return null;

  const isError = type === 'error';
  const isWarning = type === 'warning';

  let iconClass = 'fa-solid fa-circle-check toast-icon';
  if (isError) {
    iconClass = 'fa-solid fa-triangle-exclamation toast-icon';
  } else if (isWarning) {
    iconClass = 'fa-solid fa-triangle-exclamation toast-icon';
  }

  const borderStyle = {
    borderColor: isError ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--accent)'
  };

  const iconStyle = {
    color: isError ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--success)'
  };

  return (
    <div className={`toast-notification show`} style={borderStyle}>
      <i className={iconClass} style={iconStyle}></i>
      <span>{message}</span>
    </div>
  );
};

export default Toast;
