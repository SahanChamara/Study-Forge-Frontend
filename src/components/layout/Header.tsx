import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { SearchInput } from '../ui/SearchInput';
import { IconButton } from '../ui/IconButton';

export interface HeaderProps {
  onSearchOpen: () => void;
  onMobileMenuToggle: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchOpen,
  onMobileMenuToggle,
  className = '',
}) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const routeNameMap: Record<string, string> = {
    paths: 'My Learning',
    topics: 'Topic',
    practice: 'Practice Labs',
    notes: 'Smart Notes',
    review: 'Spaced Review',
    calendar: 'Calendar',
    analytics: 'Analytics',
    settings: 'Settings',
    search: 'Search',
  };

  return (
    <header className={`app-top-header ${className}`}>
      {/* Left: Mobile Menu Toggle & Dynamic Breadcrumbs */}
      <div className="header-left">
        <IconButton
          aria-label="Open mobile menu"
          icon="☰"
          size="md"
          variant="ghost"
          className="mobile-menu-trigger"
          onClick={onMobileMenuToggle}
        />

        <nav className="header-breadcrumbs" aria-label="Breadcrumb Navigation">
          <NavLink to="/" className="breadcrumb-home">
            StudyForge
          </NavLink>
          {pathSegments.map((segment, index) => {
            const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
            const isLast = index === pathSegments.length - 1;
            const displayName = routeNameMap[segment] || segment.replace(/-/g, ' ');

            return (
              <span key={url} className="breadcrumb-item">
                <span className="breadcrumb-slash">/</span>
                {isLast ? (
                  <span className="breadcrumb-active" aria-current="page">
                    {displayName}
                  </span>
                ) : (
                  <NavLink to={url} className="breadcrumb-segment-link">
                    {displayName}
                  </NavLink>
                )}
              </span>
            );
          })}
        </nav>
      </div>

      {/* Right: Quick Search Trigger & Actions */}
      <div className="header-right">
        <div className="header-search-wrapper" onClick={onSearchOpen}>
          <SearchInput
            placeholder="Search curriculum, notes, commands..."
            sizeVariant="sm"
            shortcutBadge="/"
            readOnly
            className="header-search-input"
          />
        </div>
      </div>
    </header>
  );
};
