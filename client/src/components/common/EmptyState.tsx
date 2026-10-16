import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button.js';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'We could not find any matching items for your criteria. Try adjusting your filters or search terms.',
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-vastra-surface text-vastra-muted flex items-center justify-center mb-4">
        {icon || <PackageOpen className="w-8 h-8 text-vastra-muted/80 stroke-1" />}
      </div>
      <h3 className="font-serif text-lg font-semibold text-vastra-charcoal mb-2">{title}</h3>
      <p className="text-sm text-vastra-muted mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};
