import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { IconButton } from '../ui/IconButton';

export interface NavItemDef {
  label: string;
  to: string;
  icon: string;
  end?: boolean;
}

const mainNavItems: NavItemDef[] = [
  { label: 'Dashboard', to: '/', icon: '📊', end: true },
  { label: 'My Learning', to: '/paths', icon: '🗺️' },
  { label: 'Practice Labs', to: '/practice', icon: '⚡' },
  { label: 'Smart Notes', to: '/notes', icon: '📝' },
  { label: 'Spaced Review', to: '/review', icon: '🔄' },
  { label: 'Calendar', to: '/calendar', icon: '📅' },
  { label: 'Analytics', to: '/analytics', icon: '📈' },
  { label: 'Settings', to: '/settings', icon: '⚙️' },
];

export interface SidebarProps {
  onNavClick?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavClick, className = '' }) => {
  const { user, isMockMode, logout } = useAuth();
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Learner';
  const userEmail = user?.email || 'dev@studyforge.local';

  return (
    <aside className={`app-sidebar-panel ${className}`} aria-label="Main Navigation">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">SF</div>
        <div className="sidebar-brand-text">
          <strong className="brand-title">StudyForge</strong>
          <span className="brand-subtitle">Learning OS</span>
        </div>
      </div>

      {isMockMode && (
        <div className="sidebar-mode-badge">
          <Badge variant="accent" size="sm">
            Demo Mode Active
          </Badge>
        </div>
      )}

      {/* Main Navigation Menu */}
      <nav className="sidebar-nav">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavClick}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="nav-item-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="nav-item-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom User Profile Section */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <Avatar name={userName} size="sm" status="learning" />
          <div className="sidebar-user-info">
            <strong className="sidebar-user-name" title={userName}>
              {userName}
            </strong>
            <small className="sidebar-user-email" title={userEmail}>
              {userEmail}
            </small>
          </div>
          <IconButton
            aria-label="Sign out"
            icon="🚪"
            size="sm"
            variant="ghost"
            tooltip="Sign Out"
            onClick={() => logout()}
          />
        </div>
      </div>
    </aside>
  );
};
