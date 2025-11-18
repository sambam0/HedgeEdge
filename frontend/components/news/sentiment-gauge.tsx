'use client';

import { useMarketSentiment } from '@/lib/hooks/useNews';

export function SentimentGauge() {
  const { data, isLoading } = useMarketSentiment();

  if (isLoading || !data) {
    return null;
  }

  const getColor = (score: number) => {
    if (score >= 60) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getSentiment = (score: number) => {
    if (score >= 60) return 'Positive';
    if (score >= 40) return 'Neutral';
    return 'Negative';
  };

  return (
    <div className={`rounded-lg p-6 ${getColor(data.score)}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium opacity-80">Market Sentiment</h3>
          <div className="text-3xl font-bold mt-1">
            {data.score}/100
          </div>
          <div className="text-sm font-medium mt-1">{getSentiment(data.score)}</div>
        </div>

        <div className="text-sm opacity-80">
          <div>Positive: {data.distribution.positive}</div>
          <div>Neutral: {data.distribution.neutral}</div>
          <div>Negative: {data.distribution.negative}</div>
        </div>
      </div>
    </div>
  );
}
