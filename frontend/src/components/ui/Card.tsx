import React from 'react';
import { cn } from '../../lib/cn';

/* ─── Card composable ─── */

interface CardProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'interactive' | 'alert';
  severity?: 'info' | 'warning' | 'danger' | 'success';
  onClick?: () => void;
}

const alertClasses: Record<string, string> = {
  info:    'border-info-100    bg-info-50',
  warning: 'border-warning-100 bg-warning-50',
  danger:  'border-danger-100  bg-danger-50',
  success: 'border-success-100 bg-success-50',
};

export const Card: React.FC<CardProps> = ({
  className,
  children,
  variant = 'default',
  severity,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={cn(
      'rounded-xl3 border border-nextrade-border bg-white shadow-card',
      variant === 'interactive' &&
        'cursor-pointer transition-all duration-250 hover:-translate-y-0.5 hover:shadow-panel',
      variant === 'alert' && severity && alertClasses[severity],
      className
    )}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div className={cn('flex items-start justify-between gap-4 px-5 pt-5', className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <h3 className={cn('text-base font-semibold text-nextrade-ink', className)}>{children}</h3>
);

export const CardDescription: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <p className={cn('mt-0.5 text-sm text-nextrade-muted', className)}>{children}</p>
);

export const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => <div className={cn('px-5 py-4', className)}>{children}</div>;

export const CardFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div
    className={cn(
      'flex items-center gap-3 border-t border-nextrade-border px-5 py-3',
      className
    )}
  >
    {children}
  </div>
);

/* ─── CardStat ─── */

type TrendDirection = 'up' | 'down' | 'flat';

interface CardStatProps {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: TrendDirection;
  icon?: React.ReactNode;
  className?: string;
}

const trendColors: Record<TrendDirection, string> = {
  up:   'text-success-500',
  down: 'text-danger-500',
  flat: 'text-nextrade-muted',
};

export const CardStat: React.FC<CardStatProps> = ({
  label,
  value,
  trend,
  trendDirection = 'flat',
  icon,
  className,
}) => (
  <Card className={cn('p-5', className)}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-nextrade-muted">
          {label}
        </p>
        <p className="mt-2 truncate text-2xl font-black text-nextrade-ink">
          {value}
        </p>
        {trend && (
          <p className={cn('mt-1 text-xs font-medium', trendColors[trendDirection])}>
            {trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '→'} {trend}
          </p>
        )}
      </div>
      {icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nextrade-soft text-nextrade-blue">
          {icon}
        </div>
      )}
    </div>
  </Card>
);
