import React, { type InputHTMLAttributes, useId } from 'react';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  shortcutBadge?: string;
  sizeVariant?: 'sm' | 'md' | 'lg';
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  shortcutBadge,
  sizeVariant = 'md',
  placeholder = 'Search...',
  id: customId,
  className = '',
  disabled,
  ...props
}) => {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const hasValue = typeof value === 'string' && value.length > 0;

  return (
    <div className={`search-input-container search-input-${sizeVariant} ${disabled ? 'is-disabled' : ''} ${className}`}>
      <span className="search-input-icon" aria-hidden="true">
        🔍
      </span>
      <input
        id={inputId}
        type="search"
        className="search-input-field"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      {hasValue && onClear && (
        <button
          type="button"
          className="search-input-clear-btn"
          onClick={onClear}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
      {shortcutBadge && !hasValue && (
        <kbd className="search-input-shortcut" aria-hidden="true">
          {shortcutBadge}
        </kbd>
      )}
    </div>
  );
};
