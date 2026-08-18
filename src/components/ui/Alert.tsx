import React, { type HTMLAttributes } from 'react';
import { Button } from './Button';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  message,
  onRetry,
  onDismiss,
  className = '',
  ...props
}) => {
  return (
    <div className={`alert alert-${variant} ${className}`} role="alert" {...props}>
      <div className="alert-content">
        {title && <strong className="alert-title">{title}</strong>}
        {message && <div className="alert-message">{message}</div>}
        {children}
      </div>
      <div className="alert-actions">
        {onRetry && (
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        )}
        {onDismiss && (
          <button
            type="button"
            className="alert-dismiss"
            onClick={onDismiss}
            aria-label="Dismiss alert"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
