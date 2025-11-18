export const mockPriceData = [
  { date: '2024-01-01', open: 150, high: 155, low: 148, close: 153, volume: 1000000 },
  { date: '2024-01-02', open: 153, high: 158, low: 151, close: 156, volume: 1200000 },
  { date: '2024-01-03', open: 156, high: 160, low: 154, close: 159, volume: 1100000 },
  { date: '2024-01-04', open: 159, high: 162, low: 157, close: 161, volume: 1300000 },
  { date: '2024-01-05', open: 161, high: 165, low: 159, close: 164, volume: 1400000 },
  { date: '2024-01-08', open: 164, high: 168, low: 162, close: 166, volume: 1250000 },
  { date: '2024-01-09', open: 166, high: 170, low: 164, close: 169, volume: 1350000 },
  { date: '2024-01-10', open: 169, high: 172, low: 167, close: 171, volume: 1450000 },
];

export const mockPortfolioPerformance = [
  { date: '2024-01-01', portfolio: 100000, sp500: 100000 },
  { date: '2024-02-01', portfolio: 102500, sp500: 101200 },
  { date: '2024-03-01', portfolio: 105200, sp500: 102800 },
  { date: '2024-04-01', portfolio: 108900, sp500: 104500 },
  { date: '2024-05-01', portfolio: 112400, sp500: 106300 },
  { date: '2024-06-01', portfolio: 115800, sp500: 108100 },
  { date: '2024-07-01', portfolio: 119500, sp500: 110200 },
];

export const mockSectorAllocation = [
  { sector: 'Technology', value: 45000, percentage: 36 },
  { sector: 'Healthcare', value: 25000, percentage: 20 },
  { sector: 'Financial', value: 20000, percentage: 16 },
  { sector: 'Consumer', value: 15000, percentage: 12 },
  { sector: 'Industrial', value: 12500, percentage: 10 },
  { sector: 'Energy', value: 7500, percentage: 6 },
];

export const mockYieldCurve = [
  { maturity: '3M', yield: 5.2 },
  { maturity: '6M', yield: 5.1 },
  { maturity: '1Y', yield: 4.9 },
  { maturity: '2Y', yield: 4.5 },
  { maturity: '5Y', yield: 4.2 },
  { maturity: '10Y', yield: 4.3 },
  { maturity: '30Y', yield: 4.5 },
];

export const mockSparklineData = [100, 105, 103, 108, 112, 115, 118, 120, 122, 125];

export const mockHeatMapData = [
  { sector: 'Technology', performance: 2.5 },
  { sector: 'Healthcare', performance: 1.2 },
  { sector: 'Financial', performance: -0.8 },
  { sector: 'Consumer', performance: 1.5 },
  { sector: 'Industrial', performance: 0.3 },
  { sector: 'Energy', performance: -1.2 },
  { sector: 'Materials', performance: -0.5 },
  { sector: 'Real Estate', performance: 0.8 },
  { sector: 'Utilities', performance: 0.2 },
];

export const mockCorrelationMatrix = {
  assets: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'SPY'],
  data: [
    { asset: 'AAPL', AAPL: 1.00, MSFT: 0.85, GOOGL: 0.78, AMZN: 0.72, TSLA: 0.45, SPY: 0.82 },
    { asset: 'MSFT', AAPL: 0.85, MSFT: 1.00, GOOGL: 0.88, AMZN: 0.75, TSLA: 0.42, SPY: 0.86 },
    { asset: 'GOOGL', AAPL: 0.78, MSFT: 0.88, GOOGL: 1.00, AMZN: 0.80, TSLA: 0.48, SPY: 0.84 },
    { asset: 'AMZN', AAPL: 0.72, MSFT: 0.75, GOOGL: 0.80, AMZN: 1.00, TSLA: 0.52, SPY: 0.79 },
    { asset: 'TSLA', AAPL: 0.45, MSFT: 0.42, GOOGL: 0.48, AMZN: 0.52, TSLA: 1.00, SPY: 0.55 },
    { asset: 'SPY', AAPL: 0.82, MSFT: 0.86, GOOGL: 0.84, AMZN: 0.79, TSLA: 0.55, SPY: 1.00 },
  ],
};
