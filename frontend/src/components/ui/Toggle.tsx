import React from 'react';
import { cn } from '../../lib/cn';

type ToggleSize = 'sm' | 'md';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: ToggleSize;
  id?: string;
}

const trackSizes: Record<ToggleSize, string> = {
  sm: 'h-4 w-7',
  md: 'h-5 w-9',
};
const thumbSizes: Record<ToggleSize, string> = {
  sm: 'h-3 w-3 translate-x-0.5',
  md: 'h-4 w-4 translate-x-0.5',
};
const thumbCheckedOffset: Record<ToggleSize, string> = {
  sm: 'translate-x-[14px]',
  md: 'translate-x-[18px]',
};

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  id,
}) => {
  const toggleId = id ?? `toggle-${Math.random().toString(36).slice(2)}`;
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        id={toggleId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-250 focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-nextrade-blue focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          trackSizes[size],
          checked ? 'bg-nextrade-blue' : 'bg-slate-300'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-sm',
            'transition-transform duration-250',
            thumbSizes[size],
            checked ? thumbCheckedOffset[size] : ''
          )}
        />
      </button>
      {label && (
        <label htmlFor={toggleId} className="text-sm text-nextrade-ink cursor-pointer select-none">
          {label}
        </label>
      )}
    </div>
  );
};
