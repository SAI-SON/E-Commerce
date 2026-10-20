import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export interface ToastProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  duration = 4000,
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-jewel-emerald shrink-0" />,
      border: 'border-jewel-emerald/30',
      bg: 'bg-emerald-50/90',
      titleColor: 'text-emerald-950',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-jewel-rose shrink-0" />,
      border: 'border-jewel-rose/30',
      bg: 'bg-rose-50/90',
      titleColor: 'text-rose-950',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-jewel-accent shrink-0" />,
      border: 'border-jewel-accent/30',
      bg: 'bg-amber-50/90',
      titleColor: 'text-amber-950',
    },
    info: {
      icon: <Info className="w-5 h-5 text-jewel-primary shrink-0" />,
      border: 'border-jewel-primary/30',
      bg: 'bg-indigo-50/90',
      titleColor: 'text-indigo-950',
    },
  };

  const current = typeConfig[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          role="status"
          aria-live="polite"
          className={cn(
            'fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 max-w-sm rounded-2xl shadow-jewel-lg border backdrop-blur-md',
            current.bg,
            current.border
          )}
        >
          {current.icon}
          <div className="flex-1 min-w-0 pr-2">
            <h4 className={cn('text-sm font-semibold', current.titleColor)}>
              {title}
            </h4>
            {message && (
              <p className="text-xs text-jewel-muted mt-0.5 leading-relaxed">
                {message}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-jewel-muted hover:text-jewel-ink rounded-lg transition-colors"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
