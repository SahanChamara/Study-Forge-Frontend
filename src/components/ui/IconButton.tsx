import React, { type ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  'aria-label': ariaLabel,
  icon,
  variant = 'ghost',
  size = 'md',
  loading = false,
  tooltip,
  disabled,
  className = '',
  ...props
}) => {
  const variantClass = `btn-icon-${variant}`;
  const sizeClass = `btn-icon-${size}`;
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      className={`btn-icon ${variantClass} ${sizeClass} ${loading ? 'is-loading' : ''} ${className}`}
      disabled={isDisabled}
      aria-label={ariaLabel}
      title={tooltip || ariaLabel}
      {...props}
    >
      {loading ? <Spinner size={size === 'lg' ? 'md' : 'sm'} /> : icon}
    </button>
  );
};
