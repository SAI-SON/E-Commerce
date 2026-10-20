import React from 'react';
import { cn } from '../../lib/utils.js';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'sale' | 'new' | 'lowStock' | 'success' | 'warning' | 'info' | 'danger' | 'accent' | 'indigo';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className,
}) => {
  const variants = {
    default: 'bg-jewel-primary-light/60 text-jewel-primary border-jewel-primary/20',
    sale: 'bg-jewel-accent-light text-vastra-terracotta font-semibold border-jewel-accent/30',
    new: 'bg-emerald-50 text-emerald-800 font-semibold border-emerald-200',
    lowStock: 'bg-amber-50 text-amber-800 font-semibold border-amber-200',
    success: 'bg-emerald-50 text-emerald-800 font-semibold border-emerald-200',
    warning: 'bg-orange-50 text-orange-800 font-semibold border-orange-200',
    info: 'bg-blue-50 text-blue-800 font-semibold border-blue-200',
    danger: 'bg-red-50 text-red-800 font-semibold border-red-200',
    accent: 'bg-jewel-accent-light text-jewel-accent-dark font-semibold border-jewel-accent/30',
    indigo: 'bg-jewel-primary-light text-jewel-primary font-semibold border-jewel-primary/25',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium tracking-wider uppercase transition-colors shadow-2xs',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
