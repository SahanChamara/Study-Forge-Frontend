import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  eyebrow,
  breadcrumbs,
  actions,
  children,
  className = '',
}) => {
  return (
    <header className={`page-header-container ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="page-header-breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <span key={idx} className="breadcrumb-segment">
                {idx > 0 && <span className="breadcrumb-divider">/</span>}
                {isLast || !crumb.href ? (
                  <span className="breadcrumb-current" aria-current={isLast ? 'page' : undefined}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link to={crumb.href} className="breadcrumb-link">
                    {crumb.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      )}

      <div className="page-header-main">
        <div className="page-header-text">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-description">{description}</p>}
        </div>

        {actions && <div className="page-header-actions">{actions}</div>}
      </div>

      {children && <div className="page-header-extra">{children}</div>}
    </header>
  );
};
