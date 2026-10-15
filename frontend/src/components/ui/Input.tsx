import React from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id?: string;
  label?: string;
  description?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      description,
      error,
      iconLeft,
      iconRight,
      required,
      disabled,
      readOnly,
      className,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2)}`;
    const descId = description ? `${inputId}-desc` : undefined;
    const errId = error ? `${inputId}-err` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-nextrade-ink"
          >
            {label}
            {required && (
              <span className="ms-1 text-danger-500" aria-hidden="true">*</span>
            )}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-nextrade-muted"
            >
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={[descId, errId].filter(Boolean).join(' ') || undefined}
            className={cn(
              'w-full rounded-xl border bg-white px-3 py-2.5 text-sm',
              'text-nextrade-ink placeholder:text-nextrade-muted',
              'transition-colors duration-250 outline-none',
              'focus:border-nextrade-blue focus:ring-2 focus:ring-nextrade-blue/20',
              'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-nextrade-muted',
              'read-only:bg-slate-50',
              iconLeft && 'ps-9',
              iconRight && 'pe-9',
              error
                ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
                : 'border-slate-200',
              className
            )}
            {...props}
          />
          {iconRight && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-nextrade-muted"
            >
              {iconRight}
            </span>
          )}
        </div>
        {description && !error && (
          <p id={descId} className="mt-1 text-xs text-nextrade-muted">
            {description}
          </p>
        )}
        {error && (
          <p id={errId} role="alert" className="mt-1 text-xs text-danger-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
