import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../sidebar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Sidebar', () => {
  it('desktop sidebar is always in the DOM', () => {
    const { container } = render(<Sidebar isOpen={false} onClose={() => {}} />);
    // The desktop aside has lg:flex class
    const desktopAside = container.querySelector('aside.hidden');
    expect(desktopAside).toBeInTheDocument();
  });

  it('mobile drawer is not rendered when isOpen is false', () => {
    const { container } = render(<Sidebar isOpen={false} onClose={() => {}} />);
    // Only one aside when closed
    expect(container.querySelectorAll('aside').length).toBe(1);
  });

  it('mobile drawer renders when isOpen is true', () => {
    const { container } = render(<Sidebar isOpen={true} onClose={() => {}} />);
    // Two asides: desktop + mobile drawer
    expect(container.querySelectorAll('aside').length).toBe(2);
  });

  it('clicking the overlay calls onClose', () => {
    const onClose = jest.fn();
    render(<Sidebar isOpen={true} onClose={onClose} />);
    const overlay = document.querySelector('[data-testid="mobile-overlay"]') as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
