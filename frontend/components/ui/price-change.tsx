'use client';

import { cn, formatPercent } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceChangeProps {
  value: number;
  percent?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function PriceChange({
  value,
  percent,
  size = 'md',
  showIcon = true,
  className,
}: PriceChangeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const colorClass = isPositive
    ? 'text-market-gain'
    : isNegative
    ? 'text-market-loss'
    : 'text-gray-500 dark:text-gray-400';

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <div className={cn('inline-flex items-center gap-1 font-semibold tabular-nums', colorClass, sizeClasses[size], className)}>
      {showIcon && !isNeutral && (
        <>
          {isPositive && <TrendingUp size={iconSizes[size]} />}
          {isNegative && <TrendingDown size={iconSizes[size]} />}
        </>
      )}
      <span>
        {isPositive && '+'}
        {value.toFixed(2)}
        {percent !== undefined && ` (${formatPercent(percent, 2, true)})`}
      </span>
    </div>
  );
}
