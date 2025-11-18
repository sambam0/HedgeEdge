'use client';

interface MiniSparklineProps {
  data: number[];
  positive?: boolean;
  height?: number;
}

export function MiniSparkline({ data, positive = true, height = 40 }: MiniSparklineProps) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Create SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 60;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  return (
    <svg width="60" height={height} className="inline-block">
      <path
        d={pathData}
        fill="none"
        stroke={positive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
