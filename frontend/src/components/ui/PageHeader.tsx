import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}) => (
  <div className={cn('mb-6', className)}>
    {breadcrumbs && breadcrumbs.length > 0 && (
      <nav aria-label="Fil d'Ariane" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-nextrade-muted">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span aria-hidden="true">/</span>}
            {crumb.href ? (
              <Link
                to={crumb.href}
                className="hover:text-nextrade-blue transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-nextrade-ink font-medium" aria-current="page">
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    )}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-black text-nextrade-ink">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-nextrade-muted">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  </div>
);
