import * as React from 'react';
import { cn } from './index';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-md select-none';

  const variants = {
    default: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
    neutral: 'bg-zinc-50 text-zinc-600 border border-zinc-200/60 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/50',
    info: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400 border border-sky-200/50 dark:border-sky-900/50',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[11px] gap-1 leading-none',
    md: 'px-2 py-0.5 text-xs gap-1.5 leading-none',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
