import React, { type TextareaHTMLAttributes, useId } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  showCount?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  helperText,
  error,
  showCount = false,
  maxLength,
  value,
  id: customId,
  className = '',
  disabled,
  ...props
}) => {
  const generatedId = useId();
  const textareaId = customId || generatedId;

  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
        </label>
      )}
      <div className="textarea-wrapper">
        <textarea
          id={textareaId}
          className={`form-textarea ${className}`}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
      </div>
      <div className="form-field-meta">
        {error && (
          <span id={`${textareaId}-error`} className="form-error-text" role="alert">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={`${textareaId}-helper`} className="form-helper-text">
            {helperText}
          </span>
        )}
        {showCount && maxLength && (
          <span className="form-char-count">
            {currentLength} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
};
