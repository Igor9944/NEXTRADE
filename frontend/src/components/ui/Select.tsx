import React from 'react';
import { cn } from '../../lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id?: string;
  label?: string;
  description?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      description,
      error,
      options,
      placeholder,
      required,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const selectId = id ?? `select-${Math.random().toString(36).slice(2)}`;
    const descId = description ? `${selectId}-desc` : undefined;
    const errId = error ? `${selectId}-err` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1 block text-sm font-medium text-nextrade-ink"
          >
            {label}
            {required && (
              <span className="ms-1 text-danger-500" aria-hidden="true">*</span>
            )}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={[descId, errId].filter(Boolean).join(' ') || undefined}
          className={cn(
            'w-full rounded-xl border bg-white px-3 py-2.5 text-sm',
            'text-nextrade-ink',
            'transition-colors duration-250 outline-none appearance-none',
            'focus:border-nextrade-blue focus:ring-2 focus:ring-nextrade-blue/20',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-nextrade-muted',
            'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%235d6f82\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")] bg-[length:20px_20px] bg-no-repeat bg-[position:right_0.75rem_center] pe-9',
            error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
              : 'border-slate-200',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';
