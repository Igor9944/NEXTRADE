import React from 'react';
import { cn } from '../../lib/cn';

type EmptyVariant = 'empty' | 'error' | 'search' | 'restricted';

interface EmptyStateProps {
  variant?: EmptyVariant;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const defaultIcons: Record<EmptyVariant, string> = {
  empty:      '📭',
  error:      '⚠️',
  search:     '🔍',
  restricted: '🔒',
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'empty',
  icon,
  title,
  description,
  action,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center px-6 py-16 text-center',
      className
    )}
  >
    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
      {icon ?? defaultIcons[variant]}
    </div>
    <h3 className="text-base font-semibold text-nextrade-ink">{title}</h3>
    {description && (
      <p className="mt-2 max-w-xs text-sm text-nextrade-muted">{description}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);
