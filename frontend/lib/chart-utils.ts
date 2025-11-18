export function downloadChartAsImage(chartElement: HTMLElement, filename: string) {
  // This would use html2canvas or similar library
  // Simplified version for now
  console.log('Export chart as image:', filename);
  // TODO: Implement actual image export
}

export function prepareChartData(rawData: any[], interval: string) {
  // Filter/transform data based on interval
  switch (interval) {
    case '1D':
      return rawData.slice(-1);
    case '5D':
      return rawData.slice(-5);
    case '1M':
      return rawData.slice(-30);
    case '3M':
      return rawData.slice(-90);
    case '6M':
      return rawData.slice(-180);
    case '1Y':
      return rawData.slice(-365);
    default:
      return rawData;
  }
}

export function calculateMovingAverage(data: number[], window: number): number[] {
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(NaN);
      continue;
    }

    const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / window);
  }

  return result;
}

export function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  for (let i = period; i < prices.length; i++) {
    const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + rs));
  }

  return rsi;
}
