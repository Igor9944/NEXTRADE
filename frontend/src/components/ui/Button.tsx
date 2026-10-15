import React from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-nextrade-blue text-white shadow-sm hover:bg-[#0a4f9a] active:bg-nextrade-navy focus-visible:ring-nextrade-blue',
  secondary:
    'bg-nextrade-soft text-nextrade-blue border border-nextrade-border hover:bg-nextrade-ice active:bg-nextrade-ice focus-visible:ring-nextrade-blue',
  outline:
    'border border-nextrade-blue text-nextrade-blue bg-transparent hover:bg-nextrade-ice active:bg-nextrade-ice focus-visible:ring-nextrade-blue',
  ghost:
    'text-nextrade-muted bg-transparent hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400',
  destructive:
    'bg-danger-500 text-white shadow-sm hover:bg-danger-700 active:bg-danger-700 focus-visible:ring-danger-500',
  link:
    'text-nextrade-blue underline-offset-2 hover:underline bg-transparent p-0 h-auto focus-visible:ring-nextrade-blue',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-12 px-6 text-base rounded-xl',
};

// Permet Button as={Link} to="..." pour les boutons-liens
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsProp<C extends React.ElementType = 'button'> = { as?: C } & React.ComponentPropsWithoutRef<C>;

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ButtonProps = ButtonOwnProps & { as?: React.ElementType; [key: string]: any };

export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  (
    {
      as: Component = 'button',
      variant = 'primary',
      size = 'md',
      loading = false,
      iconLeft,
      iconRight,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    return (
      <Component
        ref={ref}
        disabled={Component === 'button' ? isDisabled : undefined}
        aria-disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold',
          'transition-all duration-250 select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-55',
          variant !== 'link' && sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner size={size === 'sm' ? 'xs' : 'sm'} />
        ) : (
          iconLeft && <span aria-hidden="true">{iconLeft}</span>
        )}
        {children}
        {!loading && iconRight && <span aria-hidden="true">{iconRight}</span>}
      </Component>
    );
  }
);

Button.displayName = 'Button';
