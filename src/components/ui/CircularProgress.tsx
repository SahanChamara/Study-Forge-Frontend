import React from 'react';

export interface CircularProgressProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 80,
  strokeWidth = 7,
  variant = 'primary',
  label,
  sublabel,
  showPercent = true,
  className = '',
}) => {
  const clampedValue = Math.min(Math.max(Math.round(value), 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div
      className={`circular-progress circular-${variant} ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg className="circular-svg" width={size} height={size}>
        <circle
          className="circular-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="circular-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="circular-center">
        {showPercent && <span className="circular-percent">{clampedValue}%</span>}
        {label && <span className="circular-label">{label}</span>}
        {sublabel && <span className="circular-sublabel">{sublabel}</span>}
      </div>
    </div>
  );
};
