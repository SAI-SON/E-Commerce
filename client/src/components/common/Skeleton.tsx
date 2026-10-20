import React from 'react';
import { cn } from '../../lib/utils.js';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-xl',
    card: 'rounded-2xl h-80 w-full',
  };

  const inlineStyles: React.CSSProperties = {
    ...style,
    ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-jewel-border/50 animate-pulse',
        // Shimmer highlight effect
        'after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.8s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent',
        variantStyles[variant],
        className
      )}
      style={inlineStyles}
      aria-hidden="true"
      {...props}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-jewel-border p-3.5 space-y-3 shadow-jewel">
      <Skeleton className="w-full aspect-[3/4] rounded-xl" />
      <div className="space-y-2 pt-1">
        <Skeleton variant="text" className="w-1/3 h-3" />
        <Skeleton variant="text" className="w-4/5 h-4" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton variant="text" className="w-1/4 h-5" />
          <Skeleton variant="circular" className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};
