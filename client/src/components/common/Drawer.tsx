import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'right' | 'left' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  position = 'right',
  size = 'md',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const sizeStyles = {
    right: {
      sm: 'max-w-xs',
      md: 'max-w-md',
      lg: 'max-w-xl',
    },
    left: {
      sm: 'max-w-xs',
      md: 'max-w-md',
      lg: 'max-w-xl',
    },
    bottom: {
      sm: 'max-h-[50vh]',
      md: 'max-h-[70vh]',
      lg: 'max-h-[85vh]',
    },
  };

  const slideVariants = {
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
    },
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
    },
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
    },
  };

  const positionStyles = {
    right: 'inset-y-0 right-0 w-full h-full border-l',
    left: 'inset-y-0 left-0 w-full h-full border-r',
    bottom: 'inset-x-0 bottom-0 w-full rounded-t-3xl border-t',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-jewel-ink/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={slideVariants[position].initial}
            animate={slideVariants[position].animate}
            exit={slideVariants[position].exit}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'drawer-title' : undefined}
            className={cn(
              'fixed bg-white shadow-jewel-lg border-jewel-border z-10 flex flex-col',
              positionStyles[position],
              position === 'bottom' ? sizeStyles.bottom[size] : sizeStyles[position][size]
            )}
          >
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-jewel-border/60 shrink-0">
                <div>
                  {title && (
                    <h3
                      id="drawer-title"
                      className="font-serif text-xl font-semibold text-jewel-ink"
                    >
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="text-xs text-jewel-muted mt-0.5">{description}</p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 text-jewel-muted hover:text-jewel-ink hover:bg-jewel-bg rounded-full transition-colors -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jewel-accent"
                    aria-label="Close drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

            {footer && (
              <div className="border-t border-jewel-border/60 px-6 py-4 bg-jewel-bg/40 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
