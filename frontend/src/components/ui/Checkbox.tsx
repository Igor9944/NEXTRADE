import React from 'react';
import { cn } from '../../lib/cn';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  disabled,
  className,
  id,
  ...props
}) => {
  const checkId = id ?? `checkbox-${Math.random().toString(36).slice(2)}`;
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id={checkId}
        disabled={disabled}
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-nextrade-blue',
          'focus:ring-2 focus:ring-nextrade-blue/20 focus:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
      {(label || description) && (
        <div>
          {label && (
            <label htmlFor={checkId} className="text-sm font-medium text-nextrade-ink cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-nextrade-muted">{description}</p>
          )}
        </div>
      )}
    </div>
  );
};
