import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JobDetailPage } from '../JobDetailPage';
import { JobService } from '../../features/jobs/services/jobService';
import { ApplicationService } from '../../features/applications/services/applicationService';
import { useAuth } from '../../hooks/useAuth';
import { useParams, useNavigate } from 'react-router-dom';

// Mock Router
vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
  useNavigate: vi.fn()
}));

// Mock useAuth
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

// Mock Services
vi.mock('../../features/jobs/services/jobService', () => ({
  JobService: {
    getJobById: vi.fn()
  }
}));

vi.mock('../../features/applications/services/applicationService', () => ({
  ApplicationService: {
    hasApplied: vi.fn()
  }
}));

// Mock Components
vi.mock('../../components/Header', () => ({
  Header: () => <div data-testid="mock-header" />
}));

vi.mock('../../components/ApplyModal', () => ({
  ApplyModal: () => <div data-testid="mock-apply-modal" />
}));

describe('JobDetailPage', () => {
  const mockNavigate = vi.fn();
  const mockJob = {
    id: 'job123',
    title: 'Frontend Engineer',
    location: 'Remote',
    type: 'full_time',
    description: 'We are looking for a React expert.',
    skills: ['React', 'TypeScript'],
    salary_range: { min: 100000, max: 150000, currency: 'USD' },
    status: 'active',
    company_bio: 'A great company to work for.'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({ id: 'job123' });
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('redirects to login if user is not authenticated', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as any);

    render(<JobDetailPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', expect.any(Object));
    });
  });

  it('renders loading state', () => {
    vi.mocked(useAuth).mockReturnValue({ user: { uid: 'user123' } } as any);
    vi.mocked(JobService.getJobById).mockReturnValue(new Promise(() => {})); // Never resolves

    render(<JobDetailPage />);
    
    expect(screen.getByText(/Loading job details.../i)).toBeInTheDocument();
  });

  it('renders error state when job is not found', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: { uid: 'user123' } } as any);
    vi.mocked(JobService.getJobById).mockResolvedValue(null);

    render(<JobDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Job Not Found')).toBeInTheDocument();
    });
  });

  it('renders job details correctly', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: { uid: 'user123' } } as any);
    vi.mocked(JobService.getJobById).mockResolvedValue(mockJob as any);
    vi.mocked(ApplicationService.hasApplied).mockResolvedValue(false);

    render(<JobDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
      expect(screen.getByText('Remote')).toBeInTheDocument();
      expect(screen.getByText(/We are looking for a React expert/)).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Apply Now')).toBeInTheDocument();
    });
  });

  it('shows track button if already applied', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: { uid: 'user123' } } as any);
    vi.mocked(JobService.getJobById).mockResolvedValue(mockJob as any);
    vi.mocked(ApplicationService.hasApplied).mockResolvedValue(true);

    render(<JobDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Track Application')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Track Application'));
    expect(mockNavigate).toHaveBeenCalledWith('/seeker/tracker');
  });

  it('handles sharing the job', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: { uid: 'user123' } } as any);
    vi.mocked(JobService.getJobById).mockResolvedValue(mockJob as any);
    vi.mocked(ApplicationService.hasApplied).mockResolvedValue(false);
    
    // Mock clipboard if not present
    if (!navigator.clipboard) {
      (navigator as any).clipboard = {
        writeText: vi.fn().mockResolvedValue(undefined)
      };
    }
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText');

    render(<JobDetailPage />);

    await waitFor(() => {
      const shareButton = screen.getByText('Share Job');
      fireEvent.click(shareButton);
      expect(writeTextSpy).toHaveBeenCalled();
    });
  });
});
