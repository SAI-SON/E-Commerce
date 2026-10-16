import React from 'react';
import { cn } from '../../lib/utils.js';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'sale' | 'new' | 'lowStock' | 'success' | 'warning' | 'info' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => {
  const variants = {
    default: 'bg-vastra-surface text-vastra-charcoal border-vastra-border',
    sale: 'bg-vastra-terracotta-light text-vastra-terracotta font-medium border-vastra-terracotta/20',
    new: 'bg-vastra-olive-light text-vastra-olive font-medium border-vastra-olive/20',
    lowStock: 'bg-amber-50 text-amber-800 font-medium border-amber-200',
    success: 'bg-emerald-50 text-emerald-800 font-medium border-emerald-200',
    warning: 'bg-orange-50 text-orange-800 font-medium border-orange-200',
    info: 'bg-blue-50 text-blue-800 font-medium border-blue-200',
    danger: 'bg-red-50 text-red-800 font-medium border-red-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border tracking-wide uppercase',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
