'use client';

import { useQuote } from '@/lib/hooks/useMarket';
import { usePriceFlash, getFlashClassName } from '@/lib/hooks/usePriceFlash';
import { formatCurrency } from '@/lib/utils';
import { PriceChange } from './price-change';

interface LivePriceProps {
  ticker: string;
  showChange?: boolean;
  className?: string;
}

export function LivePrice({ ticker, showChange = true, className }: LivePriceProps) {
  const { data: quote, isLoading } = useQuote(ticker);
  const flashType = usePriceFlash(quote?.price);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>
    );
  }

  if (!quote) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`font-mono font-semibold tabular-nums ${getFlashClassName(flashType)}`}>
        {formatCurrency(quote.price)}
      </span>
      {showChange && (
        <PriceChange value={quote.change} percent={quote.change_percent} size="sm" />
      )}
    </div>
  );
}
