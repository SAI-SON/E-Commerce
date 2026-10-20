import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button.js';
import { cn } from '../../lib/utils.js';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'We could not find any matching items for your criteria. Try adjusting your filters or search terms.',
  actionText,
  onAction,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center max-w-md mx-auto animate-fade-in bg-white rounded-3xl border border-jewel-border/80 shadow-jewel-sm my-6',
        className
      )}
    >
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-jewel-bg border border-jewel-border flex items-center justify-center text-jewel-accent shadow-inner">
          {icon || <PackageOpen className="w-8 h-8 text-jewel-primary/70 stroke-[1.5]" />}
        </div>
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-jewel-accent/80 animate-ping" />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-jewel-accent" />
      </div>

      <h3 className="font-serif text-2xl font-semibold text-jewel-ink mb-2">
        {title}
      </h3>
      <p className="text-sm text-jewel-muted mb-6 leading-relaxed max-w-sm">
        {description}
      </p>

      {actionText && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};
