import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { SearchModal } from './SearchModal';

export function AppShell() {
  const { user, isMockMode, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Compute breadcrumbs from pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <div className="app-shell">
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <div className="brand">
          <span className="brand-logo">SF</span>
          <div>
            <strong>StudyForge</strong>
            <small>Learning OS</small>
          </div>
        </div>
        <div className="mobile-header-actions">
          <button
            type="button"
            className="mobile-search-btn"
            onClick={() => setSearchModalOpen(true)}
            aria-label="Search"
          >
            🔍
          </button>
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-icon"></span>
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${mobileMenuOpen ? 'is-open' : ''}`}>
        <div className="brand brand-desktop">
          <span className="brand-logo">SF</span>
          <div>
            <strong>StudyForge</strong>
            <small>Learning OS</small>
          </div>
        </div>

        {isMockMode && (
          <div className="mode-pill">
            <Badge variant="accent">Demo Mode Active</Badge>
          </div>
        )}

        <nav className="nav-menu" aria-label="Main Navigation">
          <NavLink
            to="/"
            end
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/paths"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <span className="nav-icon">🗺️</span>
            <span>Learning Paths</span>
          </NavLink>

          <NavLink
            to="/notes"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <span className="nav-icon">📝</span>
            <span>Smart Notes</span>
          </NavLink>

          <NavLink
            to="/practice"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <span className="nav-icon">⚡</span>
            <span>Practice Labs</span>
          </NavLink>

          <NavLink
            to="/review"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <span className="nav-icon">🔄</span>
            <span>Spaced Review</span>
          </NavLink>

          <NavLink
            to="/search"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <span className="nav-icon">🔍</span>
            <span>Search</span>
          </NavLink>
        </nav>

        <div className="aside-bottom">
          <div className="user-profile-summary">
            <div className="user-avatar">
              {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <strong className="user-name">{user?.displayName || 'Learner'}</strong>
              <small className="user-email" title={user?.email || ''}>
                {user?.email || 'dev@studyforge.local'}
              </small>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => logout()}
            className="btn-signout"
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="app-main-layout">
        {/* Top bar with Breadcrumbs & Global Search Button */}
        <div className="top-bar">
          <div className="breadcrumb-nav">
            <NavLink to="/">Home</NavLink>
            {pathSegments.map((segment, index) => {
              const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
              const isLast = index === pathSegments.length - 1;
              const formattedName = segment.replace(/-/g, ' ');

              return (
                <span key={url} className="breadcrumb-item">
                  <span className="breadcrumb-separator">/</span>
                  {isLast ? (
                    <span className="breadcrumb-current">{formattedName}</span>
                  ) : (
                    <NavLink to={url}>{formattedName}</NavLink>
                  )}
                </span>
              );
            })}
          </div>

          <div className="top-bar-actions">
            <button
              type="button"
              className="global-search-trigger-btn"
              onClick={() => setSearchModalOpen(true)}
              title="Search anything (Ctrl+K / Cmd+K)"
            >
              <span>🔍 Search curriculum...</span>
              <kbd>/</kbd>
            </button>
          </div>
        </div>

        <main className="app-content">
          <Outlet />
        </main>
      </div>

      {/* Global Search Palette Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
