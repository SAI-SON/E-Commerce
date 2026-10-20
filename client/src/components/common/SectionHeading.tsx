import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.js';

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  tag?: string;
  align?: 'left' | 'center';
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  tag,
  align = 'center',
  action,
  className,
}) => {
  const isCenter = align === 'center';

  return (
    <div
      className={cn(
        'mb-8 sm:mb-12',
        isCenter ? 'text-center max-w-2xl mx-auto' : 'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4',
        className
      )}
    >
      <div className={isCenter ? 'flex flex-col items-center' : ''}>
        {tag && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-jewel-accent mb-2 px-3 py-1 rounded-full bg-jewel-accent/10 border border-jewel-accent/20"
          >
            {tag}
          </motion.span>
        )}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-jewel-ink tracking-tight leading-tight">
          {title}
        </h2>
        {/* Ornamental divider line */}
        <div
          className={cn(
            'flex items-center gap-2 my-3',
            isCenter ? 'justify-center' : 'justify-start'
          )}
        >
          <span className="h-[1.5px] w-8 bg-jewel-accent/40 rounded-full" />
          <span className="w-1.5 h-1.5 rotate-45 bg-jewel-accent rounded-[1px]" />
          <span className="h-[1.5px] w-8 bg-jewel-accent/40 rounded-full" />
        </div>
        {subtitle && (
          <p className="text-jewel-muted text-sm sm:text-base max-w-xl font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && !isCenter && (
        <div className="shrink-0">{action}</div>
      )}
      {action && isCenter && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  );
};
