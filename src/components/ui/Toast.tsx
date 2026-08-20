import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { id, type = 'info', title, message, duration = 4000 } = toast;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const typeIcons: Record<string, string> = {
    success: '✓',
    info: 'ℹ',
    warning: '⚠',
    error: '✕',
  };

  return (
    <div className={`toast-item toast-${type} animate-fade-in`} role="status">
      <span className="toast-icon" aria-hidden="true">
        {typeIcons[type] || '•'}
      </span>
      <div className="toast-content">
        {title && <strong className="toast-title">{title}</strong>}
        <p className="toast-message">{message}</p>
      </div>
      <button
        type="button"
        className="toast-close-btn"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
};

export interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
