import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShortlistFeed } from '../ShortlistFeed';
import { ShortlistService } from '../../../services/shortlistService';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import React from 'react';

// Mock dependencies
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal() as any;
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

vi.mock('../../../services/shortlistService', () => ({
    ShortlistService: {
        getDailyShortlist: vi.fn(),
    },
}));

// Mock ApplyModal to avoid complex sub-rendering
vi.mock('../../../../../components/ApplyModal', () => ({
    ApplyModal: ({ job, isOpen, onClose }: any) => (
        isOpen ? (
            <div data-testid="apply-modal">
                Mock Apply Modal for {job.title}
                <button onClick={onClose}>Close</button>
            </div>
        ) : null
    ),
}));

describe('ShortlistFeed', () => {
    const mockUserId = 'user-123';
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    });

    it('renders skeletons while loading', () => {
        vi.mocked(ShortlistService.getDailyShortlist).mockReturnValue(new Promise(() => {}));
        render(<ShortlistFeed userId={mockUserId} />, { wrapper: MemoryRouter });
        expect(screen.getByLabelText(/Loading recommendations/i)).toBeDefined();
    });

    it('renders cold start view when isColdStart is true', async () => {
        vi.mocked(ShortlistService.getDailyShortlist).mockResolvedValue({
            jobs: [],
            isColdStart: true,
            lastUpdated: new Date(),
        });

        render(<ShortlistFeed userId={mockUserId} />, { wrapper: MemoryRouter });

        await waitFor(() => {
            expect(screen.getByText(/Unlock Your AI Feed/i)).toBeInTheDocument();
        });

        const actionBtn = screen.getByText(/Complete your profile/i);
        fireEvent.click(actionBtn);
        expect(mockNavigate).toHaveBeenCalledWith('/seeker/resume');
    });

    it('renders empty state when no jobs found', async () => {
        vi.mocked(ShortlistService.getDailyShortlist).mockResolvedValue({
            jobs: [],
            isColdStart: false,
            lastUpdated: new Date(),
        });

        render(<ShortlistFeed userId={mockUserId} />, { wrapper: MemoryRouter });

        await waitFor(() => {
            expect(screen.getByText(/No recommendations today/i)).toBeInTheDocument();
        });
    });

    it('renders job cards when shortlist has jobs', async () => {
        const mockJobs = [
            {
                id: 'job-1',
                title: 'Senior Engineer',
                company_bio: 'Google',
                location: 'Mountain View',
                work_mode: 'Remote',
                type: 'full_time',
                matchScore: 0.95,
                matchReason: 'Perfect fit for your React skills.',
                created_at: Timestamp.fromDate(new Date()),
            },
        ];

        vi.mocked(ShortlistService.getDailyShortlist).mockResolvedValue({
            jobs: mockJobs as any,
            isColdStart: false,
            lastUpdated: new Date(),
        });

        render(<ShortlistFeed userId={mockUserId} />, { wrapper: MemoryRouter });

        await waitFor(() => {
            expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
            expect(screen.getByText(/Perfect fit/i)).toBeInTheDocument();
            expect(screen.getByText('95% match')).toBeInTheDocument();
        });
    });

    it('navigates to job details when card is clicked', async () => {
        const mockJobs = [{ 
            id: 'job-1', title: 'J', matchScore: 0, matchReason: '', company_bio: '', location: '', work_mode: '', type: 'f', 
            created_at: Timestamp.fromDate(new Date()) 
        }];
        vi.mocked(ShortlistService.getDailyShortlist).mockResolvedValue({ 
            jobs: mockJobs as any, isColdStart: false, lastUpdated: new Date() 
        });

        render(<ShortlistFeed userId={mockUserId} />, { wrapper: MemoryRouter });

        await waitFor(() => {
            const card = screen.getByRole('button', { name: /J/i });
            fireEvent.click(card);
        });

        expect(mockNavigate).toHaveBeenCalledWith('/jobs/job-1');
    });

    it('opens apply modal when Apply button is clicked', async () => {
        const mockJobs = [{ 
            id: 'job-1', title: 'Target Job', matchScore: 0, matchReason: '', company_bio: '', location: '', work_mode: '', type: 'f', 
            created_at: Timestamp.fromDate(new Date()) 
        }];
        vi.mocked(ShortlistService.getDailyShortlist).mockResolvedValue({ 
            jobs: mockJobs as any, isColdStart: false, lastUpdated: new Date() 
        });

        render(<ShortlistFeed userId={mockUserId} />, { wrapper: MemoryRouter });

        await waitFor(() => {
            expect(screen.getByText('Target Job')).toBeInTheDocument();
        });

        const applyBtn = screen.getByRole('button', { name: /^\s*Apply\s*$/i });
        fireEvent.click(applyBtn);

        expect(screen.getByTestId('apply-modal')).toBeInTheDocument();
        expect(screen.getByText(/Mock Apply Modal for Target Job/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText('Close'));
        expect(screen.queryByTestId('apply-modal')).not.toBeInTheDocument();
    });

    it('handles error state and "Try Again" action', async () => {
        vi.mocked(ShortlistService.getDailyShortlist).mockRejectedValueOnce(new Error('API failure'));
        vi.mocked(ShortlistService.getDailyShortlist).mockResolvedValueOnce({ 
            jobs: [], isColdStart: false, lastUpdated: new Date() 
        });

        render(<ShortlistFeed userId={mockUserId} />, { wrapper: MemoryRouter });

        await waitFor(() => {
            expect(screen.getByText(/Failed to load your daily recommendations/i)).toBeInTheDocument();
        });

        const firstRetryBtn = screen.getByText(/Try Again/i);
        fireEvent.click(firstRetryBtn);

        await waitFor(() => {
            expect(screen.getByText(/No recommendations today/i)).toBeInTheDocument();
        });
    });

    it('handles Enter key on job card to navigate', async () => {
        const mockJobs = [{ 
            id: 'job-1', title: 'Key Job', matchScore: 0, matchReason: '', company_bio: '', location: '', work_mode: '', type: 'f', 
            created_at: Timestamp.fromDate(new Date()) 
        }];
        vi.mocked(ShortlistService.getDailyShortlist).mockResolvedValue({ 
            jobs: mockJobs as any, isColdStart: false, lastUpdated: new Date() 
        });

        render(<ShortlistFeed userId={mockUserId} />, { wrapper: MemoryRouter });

        await waitFor(() => {
            const card = screen.getByRole('button', { name: /Key Job/i });
            fireEvent.keyDown(card, { key: 'Enter' });
        });

        expect(mockNavigate).toHaveBeenCalledWith('/jobs/job-1');
    });

    it('handles string date in getJobDate helper', async () => {
        const mockJobs = [{ 
            id: 'job-1', title: 'String Date Job', matchScore: 0, matchReason: '', company_bio: '', location: '', work_mode: '', type: 'f', 
            created_at: '2023-05-01'
        }];
        vi.mocked(ShortlistService.getDailyShortlist).mockResolvedValue({ 
            jobs: mockJobs as any, isColdStart: false, lastUpdated: new Date() 
        });

        render(<ShortlistFeed userId={mockUserId} />, { wrapper: MemoryRouter });

        await waitFor(() => {
            expect(screen.getByText('5/1/2023')).toBeInTheDocument();
        });
    });
});
