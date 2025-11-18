import {
  formatCurrency,
  formatLargeNumber,
  formatPercent,
  formatNumber,
  getChangeColor,
  getChangeBgColor,
} from '../utils';

describe('formatCurrency', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats negative currency correctly', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats compact currency for large numbers', () => {
    expect(formatCurrency(1234567, true)).toBe('$1.23M');
  });

  it('does not format compact for small numbers', () => {
    expect(formatCurrency(999, true)).toBe('$999.00');
  });
});

describe('formatLargeNumber', () => {
  it('formats billions', () => {
    expect(formatLargeNumber(1500000000)).toBe('$1.50B');
  });

  it('formats millions', () => {
    expect(formatLargeNumber(1500000)).toBe('$1.50M');
  });

  it('formats thousands', () => {
    expect(formatLargeNumber(1500)).toBe('$1.50K');
  });

  it('formats small numbers as regular currency', () => {
    expect(formatLargeNumber(123.45)).toBe('$123.45');
  });

  it('handles negative billions', () => {
    expect(formatLargeNumber(-2000000000)).toBe('-$2.00B');
  });

  it('handles negative millions', () => {
    expect(formatLargeNumber(-3500000)).toBe('-$3.50M');
  });
});

describe('formatPercent', () => {
  it('formats positive percent with sign', () => {
    expect(formatPercent(2.345, 2, true)).toBe('+2.35%');
  });

  it('formats negative percent', () => {
    expect(formatPercent(-1.234, 2, true)).toBe('-1.23%');
  });

  it('formats zero percent', () => {
    expect(formatPercent(0, 2, true)).toBe('0.00%');
  });

  it('formats percent without sign', () => {
    expect(formatPercent(2.345, 2, false)).toBe('2.35%');
  });

  it('formats with different decimal places', () => {
    expect(formatPercent(2.34567, 3, true)).toBe('+2.346%');
  });

  it('formats with zero decimal places', () => {
    expect(formatPercent(2.9, 0, true)).toBe('+3%');
  });
});

describe('formatNumber', () => {
  it('formats regular numbers', () => {
    expect(formatNumber(1234)).toBe('1,234');
  });

  it('formats compact billions', () => {
    expect(formatNumber(5000000000, true)).toBe('5.00B');
  });

  it('formats compact millions', () => {
    expect(formatNumber(7500000, true)).toBe('7.50M');
  });

  it('formats compact thousands', () => {
    expect(formatNumber(2500, true)).toBe('2.50K');
  });

  it('does not format compact for small numbers', () => {
    expect(formatNumber(999, true)).toBe('999');
  });

  it('handles negative numbers', () => {
    expect(formatNumber(-1234567, true)).toBe('-1.23M');
  });
});

describe('getChangeColor', () => {
  it('returns gain color for positive values', () => {
    expect(getChangeColor(10.5)).toBe('text-market-gain');
  });

  it('returns loss color for negative values', () => {
    expect(getChangeColor(-5.2)).toBe('text-market-loss');
  });

  it('returns neutral color for zero', () => {
    expect(getChangeColor(0)).toBe('text-gray-500');
  });
});

describe('getChangeBgColor', () => {
  it('returns gain background for positive values', () => {
    expect(getChangeBgColor(10.5)).toBe('bg-market-gain-bg dark:bg-market-gain/10');
  });

  it('returns loss background for negative values', () => {
    expect(getChangeBgColor(-5.2)).toBe('bg-market-loss-bg dark:bg-market-loss/10');
  });

  it('returns neutral background for zero', () => {
    expect(getChangeBgColor(0)).toBe('bg-gray-100 dark:bg-neutral-900');
  });
});
