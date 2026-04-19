import { render, screen } from '@testing-library/react';
import { NewsCard } from '../news-card';

const baseArticle = {
  title: 'Markets rally on Fed news',
  description: 'Stocks surged after the Federal Reserve held rates steady.',
  url: 'https://example.com/article',
  source: 'Reuters',
  published_at: new Date().toISOString(),
  sentiment: 'positive' as const,
  tickers: [],
};

describe('NewsCard sentiment chip', () => {
  it('shows a green chip for positive sentiment', () => {
    render(<NewsCard article={baseArticle} />);
    const chip = screen.getByText('Positive');
    expect(chip.closest('span')).toHaveClass('bg-green-100');
  });

  it('shows a red chip for negative sentiment', () => {
    render(<NewsCard article={{ ...baseArticle, sentiment: 'negative' }} />);
    const chip = screen.getByText('Negative');
    expect(chip.closest('span')).toHaveClass('bg-red-100');
  });

  it('shows a gray chip for neutral sentiment', () => {
    render(<NewsCard article={{ ...baseArticle, sentiment: 'neutral' }} />);
    const chip = screen.getByText('Neutral');
    expect(chip.closest('span')).toHaveClass('bg-gray-100');
  });
});
