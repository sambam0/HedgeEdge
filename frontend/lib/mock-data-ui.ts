export const mockPortfolioPositions = [
  {
    id: 1,
    ticker: 'AAPL',
    shares: 50,
    cost_basis: 150.00,
    current_price: 175.43,
    current_value: 8771.50,
    profit_loss: 1271.50,
    profit_loss_percent: 16.95,
  },
  {
    id: 2,
    ticker: 'MSFT',
    shares: 30,
    cost_basis: 300.00,
    current_price: 378.91,
    current_value: 11367.30,
    profit_loss: 2367.30,
    profit_loss_percent: 26.30,
  },
  {
    id: 3,
    ticker: 'GOOGL',
    shares: 20,
    cost_basis: 120.00,
    current_price: 142.65,
    current_value: 2853.00,
    profit_loss: 453.00,
    profit_loss_percent: 18.88,
  },
  {
    id: 4,
    ticker: 'TSLA',
    shares: 15,
    cost_basis: 250.00,
    current_price: 242.84,
    current_value: 3642.60,
    profit_loss: -107.40,
    profit_loss_percent: -2.86,
  },
];

export const mockWatchlistStocks = [
  { id: 1, ticker: 'NVDA', current_price: 495.22, change: 8.34, change_percent: 1.71 },
  { id: 2, ticker: 'AMD', current_price: 165.89, change: -2.11, change_percent: -1.26 },
  { id: 3, ticker: 'META', current_price: 488.50, change: 5.22, change_percent: 1.08 },
  { id: 4, ticker: 'NFLX', current_price: 612.33, change: -4.67, change_percent: -0.76 },
];

export const mockMarketMovers = {
  gainers: [
    { ticker: 'NVDA', price: 495.22, change_percent: 5.43 },
    { ticker: 'META', price: 488.50, change_percent: 4.22 },
    { ticker: 'AMD', price: 165.89, change_percent: 3.89 },
  ],
  losers: [
    { ticker: 'TSLA', price: 242.84, change_percent: -3.42 },
    { ticker: 'PYPL', price: 61.45, change_percent: -2.87 },
    { ticker: 'SNAP', price: 14.23, change_percent: -2.35 },
  ],
};

export const mockScreenerResults = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    price: 175.43,
    market_cap: 2700000000000,
    pe_ratio: 28.5,
    change_percent: 1.35,
    volume: 52000000,
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.91,
    market_cap: 2820000000000,
    pe_ratio: 35.2,
    change_percent: 0.89,
    volume: 24000000,
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.65,
    market_cap: 1780000000000,
    pe_ratio: 26.3,
    change_percent: -0.45,
    volume: 31000000,
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 178.35,
    market_cap: 1850000000000,
    pe_ratio: 62.8,
    change_percent: 2.13,
    volume: 48000000,
  },
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 495.22,
    market_cap: 1220000000000,
    pe_ratio: 75.4,
    change_percent: 5.43,
    volume: 67000000,
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    price: 242.84,
    market_cap: 770000000000,
    pe_ratio: 68.2,
    change_percent: -3.42,
    volume: 125000000,
  },
];

export const mockMacroIndicators = {
  fed_funds_rate: 5.33,
  cpi: 3.2,
  unemployment: 3.8,
  gdp: 2.4,
};

export const mockSectorAllocation = [
  { label: 'Technology', value: 45, color: '#3b82f6' },
  { label: 'Healthcare', value: 20, color: '#10b981' },
  { label: 'Finance', value: 15, color: '#f59e0b' },
  { label: 'Consumer', value: 12, color: '#ef4444' },
  { label: 'Energy', value: 8, color: '#8b5cf6' },
];
