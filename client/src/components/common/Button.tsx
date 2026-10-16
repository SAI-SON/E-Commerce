import React from 'react';
import { cn } from '../../lib/utils.js';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-vastra-terracotta/40 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-sm tracking-wide';

  const variants = {
    primary:
      'bg-vastra-terracotta text-white hover:bg-vastra-terracotta-hover active:scale-[0.99] shadow-sm',
    secondary:
      'bg-vastra-surface text-vastra-charcoal hover:bg-vastra-border/60 active:scale-[0.99]',
    outline:
      'border border-vastra-border text-vastra-charcoal hover:border-vastra-charcoal hover:bg-vastra-surface/40',
    ghost: 'text-vastra-charcoal hover:bg-vastra-surface/80',
    danger: 'bg-red-700 text-white hover:bg-red-800',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3 gap-2.5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
