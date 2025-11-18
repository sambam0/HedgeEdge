'use client';

export function PortfolioPerformanceChart() {
  // Mock data for portfolio vs S&P 500
  const portfolioData = [100, 102, 105, 103, 108, 112, 115, 118, 116, 122, 125, 128];
  const sp500Data = [100, 101, 102, 103, 105, 106, 108, 109, 110, 112, 113, 115];

  const max = Math.max(...portfolioData, ...sp500Data);
  const min = Math.min(...portfolioData, ...sp500Data);
  const range = max - min || 1;

  const height = 200;
  const width = 600;
  const padding = 20;

  const createPath = (data: number[]) => {
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((value - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="w-full">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding + (i / 4) * (height - 2 * padding);
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              className="stroke-gray-200 dark:stroke-neutral-800"
            />
          );
        })}

        {/* S&P 500 line */}
        <path
          d={createPath(sp500Data)}
          fill="none"
          stroke="rgb(156, 163, 175)"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* Portfolio line */}
        <path
          d={createPath(portfolioData)}
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="3"
        />
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Your Portfolio (+28%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-gray-400 border-t-2 border-dashed" />
          <span className="text-sm text-gray-600 dark:text-gray-400">S&P 500 (+15%)</span>
        </div>
      </div>
    </div>
  );
}
