import React from 'react';
import { cn } from '../../lib/cn';

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id?: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { id, label, description, error, required, disabled, className, ...props },
    ref
  ) => {
    const textareaId = id ?? `textarea-${Math.random().toString(36).slice(2)}`;
    const descId = description ? `${textareaId}-desc` : undefined;
    const errId = error ? `${textareaId}-err` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1 block text-sm font-medium text-nextrade-ink"
          >
            {label}
            {required && (
              <span className="ms-1 text-danger-500" aria-hidden="true">*</span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={[descId, errId].filter(Boolean).join(' ') || undefined}
          className={cn(
            'w-full rounded-xl border bg-white px-3 py-2.5 text-sm',
            'text-nextrade-ink placeholder:text-nextrade-muted',
            'transition-colors duration-250 outline-none resize-y min-h-[96px]',
            'focus:border-nextrade-blue focus:ring-2 focus:ring-nextrade-blue/20',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-nextrade-muted',
            error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
              : 'border-slate-200',
            className
          )}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
