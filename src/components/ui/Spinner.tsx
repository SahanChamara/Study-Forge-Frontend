import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '', color = 'currentColor' }) => {
  const pixelSize = size === 'sm' ? 16 : size === 'lg' ? 32 : 22;

  return (
    <svg
      className={`spinner spinner-${size} ${className}`}
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.415, 31.415"
        strokeDashoffset="10"
        style={{ opacity: 0.25 }}
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="20, 42.83"
        style={{
          transformOrigin: 'center',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </svg>
  );
};
