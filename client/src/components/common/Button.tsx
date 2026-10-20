import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils.js';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  ...props
}, ref) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none rounded-xl tracking-wide disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jewel-accent focus-visible:ring-offset-2 overflow-hidden';

  const variants = {
    primary:
      'bg-jewel-primary text-white hover:bg-jewel-primary-hover shadow-jewel hover:shadow-jewel-hover hover:ring-1 hover:ring-jewel-primary/30 active:bg-jewel-primary-dark',
    accent:
      'bg-jewel-accent text-white hover:bg-jewel-accent-hover shadow-jewel hover:shadow-saffron-glow active:bg-jewel-accent-dark',
    secondary:
      'bg-white text-jewel-ink border border-jewel-border hover:bg-jewel-bg hover:border-jewel-ink/40 shadow-jewel-sm active:bg-jewel-border/30',
    outline:
      'border border-jewel-border text-jewel-ink hover:border-jewel-primary hover:text-jewel-primary hover:bg-jewel-primary-light/40 active:bg-jewel-primary-light',
    ghost:
      'text-jewel-ink hover:bg-jewel-primary-light/50 hover:text-jewel-primary active:bg-jewel-primary-light',
    danger:
      'bg-jewel-rose text-white hover:bg-jewel-rose-hover shadow-jewel hover:shadow-rose-glow active:bg-jewel-rose-dark',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-5 py-2.5 min-h-[44px] gap-2',
    lg: 'text-base px-7 py-3.5 min-h-[48px] gap-2.5',
  };

  return (
    <motion.button
      ref={ref}
      whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
      whileHover={disabled || isLoading ? undefined : { y: -1 }}
      transition={{ duration: 0.15 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
      <span className="inline-flex items-center gap-1.5">{children}</span>
    </motion.button>
  );
});

Button.displayName = 'Button';
