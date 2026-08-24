import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';

export interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="mobile-nav-backdrop" onClick={onClose} aria-modal="true" role="dialog">
      <div
        className="mobile-nav-drawer animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-nav-drawer-header">
          <button
            type="button"
            className="mobile-drawer-close-btn"
            onClick={onClose}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>
        <Sidebar onNavClick={onClose} />
      </div>
    </div>
  );
};
