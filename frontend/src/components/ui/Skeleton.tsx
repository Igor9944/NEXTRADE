import React from 'react';
import { cn } from '../../lib/cn';

const base = 'animate-pulse rounded bg-slate-200';

interface SkeletonBlockProps {
  className?: string;
  style?: React.CSSProperties;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({ className, style }) => (
  <div className={cn(base, className)} style={style} aria-hidden="true" />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <div className={cn('space-y-2', className)} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={cn(base, 'h-3')}
        style={{ width: i === lines - 1 ? '65%' : '100%' }}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'rounded-xl3 border border-nextrade-border bg-white p-5 shadow-card space-y-3',
      className
    )}
    aria-hidden="true"
  >
    <SkeletonBlock className="h-4 w-1/3" />
    <SkeletonBlock className="h-7 w-1/2" />
    <SkeletonBlock className="h-3 w-2/3" />
  </div>
);

export const SkeletonKPI: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'rounded-xl3 border border-nextrade-border bg-white p-5 shadow-card',
      className
    )}
    aria-hidden="true"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2 flex-1">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-7 w-24" />
        <SkeletonBlock className="h-3 w-16" />
      </div>
      <SkeletonBlock className="h-10 w-10 rounded-xl" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => (
  <div className="space-y-2" aria-hidden="true">
    {/* header */}
    <div className="grid gap-4 pb-3 border-b border-nextrade-border" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBlock key={i} className="h-3 w-3/4" />
      ))}
    </div>
    {/* rows */}
    {Array.from({ length: rows }).map((_, ri) => (
      <div
        key={ri}
        className="grid gap-4 py-3 border-b border-slate-100"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }).map((_, ci) => (
          <SkeletonBlock key={ci} className="h-4" style={{ width: `${60 + Math.random() * 30}%` }} />
        ))}
      </div>
    ))}
  </div>
);
