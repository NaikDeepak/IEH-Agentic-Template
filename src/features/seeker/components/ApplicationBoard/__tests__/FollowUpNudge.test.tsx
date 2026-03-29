import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FollowUpNudge } from '../FollowUpNudge';

describe('FollowUpNudge', () => {
  it('renders default reason when none is provided', () => {
    render(<FollowUpNudge />);
    expect(screen.getByText("This application hasn't moved — consider reaching out.")).toBeInTheDocument();
  });

  it('renders custom reason when provided', () => {
    const customReason = 'Last contact was 10 days ago.';
    render(<FollowUpNudge reason={customReason} />);
    expect(screen.getByText(customReason)).toBeInTheDocument();
  });

  it('opens email client on button click', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<FollowUpNudge />);
    
    const button = screen.getByRole('button', { name: /send follow-up/i });
    fireEvent.click(button);
    
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('mailto:?subject=Follow up on my application'),
      '_blank'
    );
    
    openSpy.mockRestore();
  });

  it('stops propagation on click', () => {
    const onParentClick = vi.fn();
    render(
      <div onClick={onParentClick} role="presentation">
        <FollowUpNudge />
      </div>
    );
    
    const button = screen.getByRole('button', { name: /send follow-up/i });
    fireEvent.click(button);
    
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
