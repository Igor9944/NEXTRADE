import React from 'react';
import { cn } from '../../lib/cn';
import { SkeletonTable } from './Skeleton';
import { EmptyState } from './EmptyState';

/* ─── Primitives ─── */

export const Table: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div className="w-full overflow-x-auto">
    <table className={cn('w-full min-w-full text-sm', className)}>{children}</table>
  </div>
);

export const TableHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <thead className={cn(className)}>
    <tr className="border-b border-nextrade-border">{children}</tr>
  </thead>
);

export const TableBody: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => <tbody className={cn(className)}>{children}</tbody>;

export const TableRow: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <tr className={cn('border-b border-slate-100 hover:bg-slate-50/60 transition-colors', className)}>
    {children}
  </tr>
);

export const TableHead: React.FC<{
  className?: string;
  children: React.ReactNode;
  align?: 'start' | 'end' | 'center';
}> = ({ className, children, align = 'start' }) => (
  <th
    scope="col"
    className={cn(
      'pb-3 pe-4 text-xs font-semibold uppercase tracking-wide text-nextrade-muted',
      align === 'end' && 'text-end',
      align === 'center' && 'text-center',
      align === 'start' && 'text-start',
      className
    )}
  >
    {children}
  </th>
);

export const TableCell: React.FC<{
  className?: string;
  children: React.ReactNode;
  align?: 'start' | 'end' | 'center';
  muted?: boolean;
}> = ({ className, children, align = 'start', muted }) => (
  <td
    className={cn(
      'py-3 pe-4 text-sm align-middle',
      align === 'end' && 'text-end',
      align === 'center' && 'text-center',
      align === 'start' && 'text-start',
      muted ? 'text-nextrade-muted' : 'text-nextrade-ink',
      className
    )}
  >
    {children}
  </td>
);

export const TableActions: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <td className={cn('py-3 pe-0 text-end align-middle', className)}>
    <div className="flex items-center justify-end gap-2">{children}</div>
  </td>
);

/* ─── DataTable composable avec états intégrés ─── */

interface DataTableProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  cols?: number;
  children: React.ReactNode;
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  loading,
  error,
  empty,
  emptyTitle = 'Aucune donnée',
  emptyDescription,
  emptyAction,
  cols = 4,
  children,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn('rounded-xl3 border border-nextrade-border bg-white p-5 shadow-card', className)}>
        <SkeletonTable rows={5} cols={cols} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('rounded-xl3 border border-nextrade-border bg-white shadow-card', className)}>
        <EmptyState
          variant="error"
          title="Erreur de chargement"
          description={error}
        />
      </div>
    );
  }

  if (empty) {
    return (
      <div className={cn('rounded-xl3 border border-nextrade-border bg-white shadow-card', className)}>
        <EmptyState
          variant="empty"
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl3 border border-nextrade-border bg-white shadow-card overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  );
};
