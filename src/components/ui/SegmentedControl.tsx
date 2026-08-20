import React from 'react';

export interface SegmentedOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  className = '',
  'aria-label': ariaLabel = 'View Selector',
}) => {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`segmented-control segmented-${size} ${fullWidth ? 'segmented-full-width' : ''} ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={opt.disabled}
            className={`segmented-item ${isSelected ? 'is-selected' : ''}`}
            onClick={() => onChange(opt.id)}
          >
            {opt.icon && <span className="segmented-icon">{opt.icon}</span>}
            <span className="segmented-label">{opt.label}</span>
            {opt.count !== undefined && (
              <span className={`segmented-badge ${isSelected ? 'badge-selected' : ''}`}>
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
