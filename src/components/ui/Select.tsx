import React, { type SelectHTMLAttributes, useId } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  helperText,
  error,
  options = [],
  children,
  id: customId,
  className = '',
  disabled,
  ...props
}) => {
  const generatedId = useId();
  const selectId = customId || generatedId;

  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <div className="select-wrapper">
        <select
          id={selectId}
          className={`form-select ${className}`}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <span className="select-chevron" aria-hidden="true">
          ▾
        </span>
      </div>
      {error && (
        <span id={`${selectId}-error`} className="form-error-text" role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${selectId}-helper`} className="form-helper-text">
          {helperText}
        </span>
      )}
    </div>
  );
};
