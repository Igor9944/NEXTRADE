import React from 'react';
import { cn } from '../../lib/cn';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'pending'
  | 'processing';

const variantClasses: Record<BadgeVariant, string> = {
  success:    'bg-success-50  text-success-700',
  warning:    'bg-warning-50  text-warning-700',
  danger:     'bg-danger-50   text-danger-700',
  info:       'bg-info-50     text-info-700',
  neutral:    'bg-slate-100   text-slate-600',
  pending:    'bg-warning-100 text-warning-700',
  processing: 'bg-info-100    text-info-700',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  rounded?: 'full' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className,
  rounded = 'full',
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold',
      rounded === 'full' ? 'rounded-full' : 'rounded-md',
      variantClasses[variant],
      className
    )}
  >
    {children}
  </span>
);

/** Mappe un statut métier vers une variante de badge. */
export function statusToBadge(status: string): BadgeVariant {
  const s = status?.toUpperCase();
  if (['VERIFIE', 'LIVREE', 'PAID', 'VALIDEE', 'TERMINE', 'OK'].includes(s))
    return 'success';
  if (['ANNULEE', 'REJETE', 'BLOCKED', 'ECHOUEE', 'OUT'].includes(s))
    return 'danger';
  if (['EN_ATTENTE', 'PENDING', 'NON_VERIFIE', 'LOW'].includes(s))
    return 'warning';
  if (['EN_COURS', 'EN_TRANSIT', 'PROCESSING', 'EXPEDIEE', 'PRISE_EN_CHARGE'].includes(s))
    return 'processing';
  if (['PREPARATION', 'A_FAIRE', 'CONFIRMED'].includes(s))
    return 'info';
  return 'neutral';
}
