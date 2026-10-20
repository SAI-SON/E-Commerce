import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils.js';

export interface CardProps extends HTMLMotionProps<'div'> {
  hoverable?: boolean;
  glass?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  children,
  className,
  hoverable = false,
  glass = false,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      whileHover={hoverable ? { y: -4, transition: { duration: 0.2, ease: 'easeOut' } } : undefined}
      className={cn(
        'rounded-2xl transition-all duration-300',
        glass
          ? 'glass-card'
          : 'bg-white border border-jewel-border shadow-jewel',
        hoverable && 'hover:shadow-jewel-hover hover:border-jewel-accent/40 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';
