import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatting
export function formatCurrency(value: number, compact: boolean = false): string {
  if (compact && Math.abs(value) >= 1000) {
    return formatLargeNumber(value);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Large number formatting (K, M, B)
export function formatLargeNumber(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e9) {
    return `${sign}$${(absValue / 1e9).toFixed(2)}B`;
  } else if (absValue >= 1e6) {
    return `${sign}$${(absValue / 1e6).toFixed(2)}M`;
  } else if (absValue >= 1e3) {
    return `${sign}$${(absValue / 1e3).toFixed(2)}K`;
  }

  return formatCurrency(value);
}

// Percentage formatting
export function formatPercent(
  value: number,
  decimals: number = 2,
  showSign: boolean = true
): string {
  const formatted = value.toFixed(decimals);
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${formatted}%`;
}

// Regular number formatting
export function formatNumber(value: number, compact: boolean = false): string {
  if (compact && Math.abs(value) >= 1000) {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1e9) {
      return `${sign}${(absValue / 1e9).toFixed(2)}B`;
    } else if (absValue >= 1e6) {
      return `${sign}${(absValue / 1e6).toFixed(2)}M`;
    } else if (absValue >= 1e3) {
      return `${sign}${(absValue / 1e3).toFixed(2)}K`;
    }
  }

  return new Intl.NumberFormat('en-US').format(value);
}

// Relative time formatting
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin}m ago`;
  } else if (diffHour < 24) {
    return `${diffHour}h ago`;
  } else if (diffDay < 7) {
    return `${diffDay}d ago`;
  } else {
    return then.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}

// Get color class for gain/loss
export function getChangeColor(value: number): string {
  if (value > 0) return 'text-market-gain';
  if (value < 0) return 'text-market-loss';
  return 'text-gray-500';
}

// Get background color class for gain/loss
export function getChangeBgColor(value: number): string {
  if (value > 0) return 'bg-market-gain-bg dark:bg-market-gain/10';
  if (value < 0) return 'bg-market-loss-bg dark:bg-market-loss/10';
  return 'bg-gray-100 dark:bg-neutral-900';
}
