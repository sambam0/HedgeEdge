import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'gain' | 'loss' | 'neutral' | 'info' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100',
    gain: 'bg-market-gain text-white',
    loss: 'bg-market-loss text-white',
    neutral: 'bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300',
    info: 'bg-primary-600 text-white',
    warning: 'bg-amber-500 text-white',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
