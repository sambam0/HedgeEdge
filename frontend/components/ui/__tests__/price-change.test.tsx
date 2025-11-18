import { render, screen } from '@testing-library/react';
import { PriceChange } from '../price-change';

describe('PriceChange', () => {
  it('renders positive change in green with plus sign', () => {
    render(<PriceChange value={10.50} />);

    const element = screen.getByText('+10.50');
    expect(element).toBeInTheDocument();
    expect(element.parentElement).toHaveClass('text-market-gain');
  });

  it('renders negative change in red without plus sign', () => {
    render(<PriceChange value={-5.25} />);

    const element = screen.getByText('-5.25');
    expect(element).toBeInTheDocument();
    expect(element.parentElement).toHaveClass('text-market-loss');
  });

  it('renders zero change in gray', () => {
    render(<PriceChange value={0} />);

    const element = screen.getByText('0.00');
    expect(element).toBeInTheDocument();
    expect(element.parentElement).toHaveClass('text-gray-500');
  });

  it('renders with percentage when provided', () => {
    render(<PriceChange value={10.50} percent={2.5} />);

    expect(screen.getByText(/\+10\.50.*\(\+2\.50%\)/)).toBeInTheDocument();
  });

  it('renders without icon when showIcon is false', () => {
    const { container } = render(<PriceChange value={10.50} showIcon={false} />);

    // Check that no TrendingUp or TrendingDown SVG is rendered
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(0);
  });

  it('applies custom className', () => {
    const { container } = render(
      <PriceChange value={10.50} className="custom-class" />
    );

    const priceChangeDiv = container.querySelector('div');
    expect(priceChangeDiv).toHaveClass('custom-class');
  });

  it('applies correct size class for small size', () => {
    const { container } = render(<PriceChange value={10.50} size="sm" />);

    const priceChangeDiv = container.querySelector('div');
    expect(priceChangeDiv).toHaveClass('text-xs');
  });

  it('applies correct size class for large size', () => {
    const { container } = render(<PriceChange value={10.50} size="lg" />);

    const priceChangeDiv = container.querySelector('div');
    expect(priceChangeDiv).toHaveClass('text-base');
  });
});
