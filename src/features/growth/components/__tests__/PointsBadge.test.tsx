import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PointsBadge } from '../PointsBadge';
import { useAuth } from '../../../../hooks/useAuth';

// Mock useAuth
vi.mock('../../../../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

describe('PointsBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with points', () => {
    vi.mocked(useAuth).mockReturnValue({
      userData: { browniePoints: 120 }
    } as any);

    render(<PointsBadge />);

    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('Brownie Points')).toBeInTheDocument();
  });

  it('renders 0 if browniePoints is missing', () => {
    vi.mocked(useAuth).mockReturnValue({
      userData: {}
    } as any);

    render(<PointsBadge />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    vi.mocked(useAuth).mockReturnValue({
      userData: { browniePoints: 50 }
    } as any);

    render(<PointsBadge showLabel={false} />);

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.queryByText('Brownie Points')).not.toBeInTheDocument();
  });

  it('handles non-numeric points gracefully', () => {
    vi.mocked(useAuth).mockReturnValue({
      userData: { browniePoints: 'invalid' }
    } as any);

    render(<PointsBadge />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
