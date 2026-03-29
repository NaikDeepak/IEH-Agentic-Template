import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResumeAnalyzer } from '../ResumeAnalyzer';
import { analyzeResume, getLatestResume } from '../../../services/resumeService';
import { useAuth } from '../../../../../hooks/useAuth';
import { toast } from 'sonner';
import React from 'react';

// Mock child components to simplify testing
vi.mock('../ResumeInput', () => ({
  ResumeInput: ({ onSubmit, isLoading }: { onSubmit: any, isLoading: boolean }) => (
    <div data-testid="resume-input">
      <button onClick={() => onSubmit({ type: 'text', content: 'Mock Resume' })} disabled={isLoading}>
        Analyze
      </button>
      {isLoading && <span>Analyzing...</span>}
    </div>
  ),
}));

vi.mock('../AnalysisDisplay', () => ({
  AnalysisDisplay: ({ result, onReset }: { result: any, onReset: any }) => (
    <div data-testid="analysis-display">
      <span>Score: {result.atsScore}</span>
      <button onClick={onReset}>Reset</button>
    </div>
  ),
}));

// Mock services and hooks
vi.mock('../../../services/resumeService', () => ({
  analyzeResume: vi.fn(),
  getLatestResume: vi.fn(),
}));

vi.mock('../../../../../hooks/useAuth', () => ({
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

describe('ResumeAnalyzer', () => {
  const mockUser = { uid: 'user-123' };
  const mockAnalysis = { atsScore: 85, summary: 'Good resume' };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
  });

  it('renders loading state initially', async () => {
    (getLatestResume as any).mockReturnValue(new Promise(() => {}));
    render(<ResumeAnalyzer />);
    expect(screen.getByText(/Loading your resume\.\.\./i)).toBeInTheDocument();
  });

  it('renders existing resume if found', async () => {
    (getLatestResume as any).mockResolvedValue(mockAnalysis);
    render(<ResumeAnalyzer />);

    await waitFor(() => {
      expect(screen.getByTestId('analysis-display')).toBeInTheDocument();
      expect(screen.getByText(/Score: 85/i)).toBeInTheDocument();
    });
  });

  it('renders upload view if no existing resume found', async () => {
    (getLatestResume as any).mockResolvedValue(null);
    render(<ResumeAnalyzer />);

    await waitFor(() => {
      expect(screen.getByTestId('resume-input')).toBeInTheDocument();
    });
  });

  it('handles resume analysis workflow', async () => {
    (getLatestResume as any).mockResolvedValue(null);
    (analyzeResume as any).mockResolvedValue(mockAnalysis);

    render(<ResumeAnalyzer />);

    await waitFor(() => {
      expect(screen.getByTestId('resume-input')).toBeInTheDocument();
    });

    const analyzeBtn = screen.getByRole('button', { name: /Analyze/i });
    fireEvent.click(analyzeBtn);

    expect(screen.getByText(/Analyzing\.\.\./i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('analysis-display')).toBeInTheDocument();
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('analyzed'));
    });
  });

  it('handles analysis errors', async () => {
    (getLatestResume as any).mockResolvedValue(null);
    (analyzeResume as any).mockRejectedValue(new Error('AI Service Down'));

    render(<ResumeAnalyzer />);

    await waitFor(() => {
      expect(screen.getByTestId('resume-input')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Analyze/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to analyze resume/i)).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('handles resetting the analysis view', async () => {
    (getLatestResume as any).mockResolvedValue(mockAnalysis);
    render(<ResumeAnalyzer />);

    await waitFor(() => {
      expect(screen.getByTestId('analysis-display')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Reset/i }));

    expect(screen.getByTestId('resume-input')).toBeInTheDocument();
  });

  it('switches to upload view via "Upload New CV" button', async () => {
    (getLatestResume as any).mockResolvedValue(mockAnalysis);
    render(<ResumeAnalyzer />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Upload New CV/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Upload New CV/i }));

    expect(screen.getByTestId('resume-input')).toBeInTheDocument();
  });
});
