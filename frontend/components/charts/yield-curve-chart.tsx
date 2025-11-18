'use client';

interface YieldCurveChartProps {
  height?: number;
}

export function YieldCurveChart({ height = 300 }: YieldCurveChartProps) {
  // Mock yield curve data
  const maturities = ['1M', '3M', '6M', '1Y', '2Y', '5Y', '10Y', '20Y', '30Y'];
  const yields = [5.3, 5.4, 5.35, 5.2, 4.9, 4.5, 4.3, 4.5, 4.6];

  const max = Math.max(...yields);
  const min = Math.min(...yields);
  const range = max - min || 1;

  const width = 700;
  const padding = 40;
  const chartHeight = height - 2 * padding;
  const chartWidth = width - 2 * padding;

  const createPath = () => {
    const points = yields.map((value, index) => {
      const x = padding + (index / (yields.length - 1)) * chartWidth;
      const y = height - padding - ((value - min) / range) * chartHeight;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="w-full">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding + (i / 4) * chartHeight;
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

        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding + (i / 4) * chartHeight;
          const value = max - (i / 4) * range;
          return (
            <text
              key={i}
              x={padding - 10}
              y={y + 5}
              textAnchor="end"
              className="text-xs fill-gray-600 dark:fill-gray-400"
            >
              {value.toFixed(1)}%
            </text>
          );
        })}

        {/* Yield curve line */}
        <path
          d={createPath()}
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="3"
        />

        {/* Data points */}
        {yields.map((value, index) => {
          const x = padding + (index / (yields.length - 1)) * chartWidth;
          const y = height - padding - ((value - min) / range) * chartHeight;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="rgb(59, 130, 246)"
              className="hover:r-6 transition-all cursor-pointer"
            />
          );
        })}

        {/* X-axis labels */}
        {maturities.map((maturity, index) => {
          const x = padding + (index / (yields.length - 1)) * chartWidth;
          return (
            <text
              key={index}
              x={x}
              y={height - padding + 20}
              textAnchor="middle"
              className="text-xs fill-gray-600 dark:fill-gray-400"
            >
              {maturity}
            </text>
          );
        })}
      </svg>

      {/* Current date info */}
      <div className="text-center mt-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Treasury Yield Curve as of {new Date().toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
