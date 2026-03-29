import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApplyModal } from '../ApplyModal';
import { ApplicationService } from '../../features/applications/services/applicationService';
import { ProfileService } from '../../features/seeker/services/profileService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import React from 'react';

// Mock focus-trap-react
vi.mock('focus-trap-react', () => ({
  FocusTrap: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock services and hooks
vi.mock('../../features/applications/services/applicationService', () => ({
  ApplicationService: {
    hasApplied: vi.fn(),
    submitApplication: vi.fn(),
  },
}));

vi.mock('../../features/seeker/services/profileService', () => ({
  ProfileService: {
    getProfile: vi.fn(),
  },
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
}));

describe('ApplyModal', () => {
  const mockJob = {
    id: 'job-123',
    employer_id: 'employer-456',
    title: 'Software Engineer',
    screening_questions: [
      { question: 'What is your favorite language?', hint: 'e.g. TypeScript' }
    ],
  } as any;

  const mockUser = { uid: 'user-789', email: 'seeker@example.com' };
  const mockUserData = { role: 'seeker', displayName: 'Test Seeker' };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser, userData: mockUserData });
    (ApplicationService.hasApplied as any).mockResolvedValue(false);
    (ProfileService.getProfile as any).mockResolvedValue({ headline: 'Full Stack Dev' });
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ApplyModal job={mockJob} isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders loading state initially', async () => {
    // Delay the resolution of hasApplied to see loading state
    (ApplicationService.hasApplied as any).mockReturnValue(new Promise(() => {}));

    render(<ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText(/Checking application status/i)).toBeInTheDocument();
  });

  it('renders screening questions and handles submission', async () => {
    render(<ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />);

    // Wait for initial load to finish
    await waitFor(() => {
      expect(screen.queryByText(/Checking application status/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/What is your favorite language\?/i)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Your answer\.\.\./i);
    fireEvent.change(textarea, { target: { value: 'TypeScript' } });

    (ApplicationService.submitApplication as any).mockResolvedValue({ id: 'app-999' });

    const submitBtn = screen.getByRole('button', { name: /Submit Application/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(ApplicationService.submitApplication).toHaveBeenCalledWith(expect.objectContaining({
        job_id: 'job-123',
        candidate_id: 'user-789',
        answers: { 'What is your favorite language?': 'TypeScript' }
      }));
      expect(screen.getByText(/Application Submitted/i)).toBeInTheDocument();
    });
    
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows error if non-seeker role tries to apply', async () => {
    (useAuth as any).mockReturnValue({ 
      user: mockUser, 
      userData: { role: 'employer' } 
    });

    render(<ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.queryByText(/Checking application status/i)).not.toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /Submit Application/i });
    expect(submitBtn).toBeDisabled();
  });

  it('handles "already applied" state', async () => {
    (ApplicationService.hasApplied as any).mockResolvedValue(true);

    render(<ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Already Applied/i)).toBeInTheDocument();
      expect(screen.getByText(/Track your progress in the dashboard/i)).toBeInTheDocument();
    });
  });

  it('handles submission errors', async () => {
    render(<ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.queryByText(/Checking application status/i)).not.toBeInTheDocument();
    });

    (ApplicationService.submitApplication as any).mockRejectedValue(new Error('Network error'));
    
    const textarea = screen.getByPlaceholderText(/Your answer\.\.\./i);
    fireEvent.change(textarea, { target: { value: 'TypeScript' } });
    
    const submitBtn = screen.getByRole('button', { name: /Submit Application/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Failed to submit application/i)).toBeInTheDocument();
    });
    
    expect(toast.error).toHaveBeenCalled();
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const onClose = vi.fn();
    render(<ApplyModal job={mockJob} isOpen={true} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.queryByText(/Checking application status/i)).not.toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<ApplyModal job={mockJob} isOpen={true} onClose={onClose} />);

    const modal = screen.getByRole('presentation');
    fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('handles "View Tracker" click in success state', async () => {
    const originalLocation = window.location;
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { ...originalLocation, href: '' };

    render(<ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.queryByText(/Checking application status/i)).not.toBeInTheDocument();
    });

    // FILL REQUIRED FIELDS
    const textarea = screen.getByPlaceholderText(/Your answer\.\.\./i);
    fireEvent.change(textarea, { target: { value: 'TypeScript' } });

    (ApplicationService.submitApplication as any).mockResolvedValue({ id: 'app-999' });
    fireEvent.click(screen.getByRole('button', { name: /Submit Application/i }));

    await waitFor(() => {
      expect(screen.getByText(/Application Submitted/i)).toBeInTheDocument();
    });

    const trackerBtn = screen.getByRole('button', { name: /View Tracker/i });
    fireEvent.click(trackerBtn);

    expect(window.location.href).toBe('/seeker/tracker');
    
    // @ts-ignore
    window.location = originalLocation;
  });
});
