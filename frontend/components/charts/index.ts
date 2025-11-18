export { PriceChart } from './price-chart';
export { PortfolioPerformanceChart } from './portfolio-performance-chart';
export { DonutChart } from './donut-chart';
export { MiniSparkline } from './mini-sparkline';
export { YieldCurveChart } from './yield-curve-chart';
export { HeatMap } from './heat-map';
export { CandlestickChart } from './candlestick-chart';
export { BarChart } from './bar-chart';
export { CorrelationMatrix } from './correlation-matrix';

// Lazy-loaded versions for better performance
export {
  LazyCandlestickChart,
  LazyCorrelationMatrix,
  LazyPriceChart,
  LazyPortfolioPerformanceChart,
} from './lazy-charts';
