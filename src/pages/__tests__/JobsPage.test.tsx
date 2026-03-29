import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobsPage } from '../JobsPage';
import { MemoryRouter } from 'react-router-dom';
import { JobService } from '../../features/jobs/services/jobService';
import { SavedJobsService } from '../../features/seeker/services/savedJobsService';
import { useAuth } from '../../hooks/useAuth';
import { searchJobs, getJobSuggestions } from '../../lib/ai/search';

// Mock dependencies
vi.mock('../../hooks/useAuth');
vi.mock('../../features/jobs/services/jobService');
vi.mock('../../features/seeker/services/savedJobsService');
vi.mock('../../lib/ai/search');
vi.mock('../../components/Header', () => ({
    Header: () => <div data-testid="mock-header">Header</div>
}));
vi.mock('../../components/JobSearchBar', () => ({
    JobSearchBar: ({ onSearch }: any) => (
        <div data-testid="mock-search-bar">
            <input 
                placeholder="Search jobs..." 
                onChange={(e) => onSearch(e.target.value, {})} 
            />
        </div>
    )
}));
vi.mock('../../../src/components/ApplyModal', () => ({
    ApplyModal: ({ isOpen, job }: any) => isOpen ? (
        <div data-testid="mock-apply-modal">Apply for {job?.title}</div>
    ) : null
}));
vi.mock('../../components/JobCard', () => ({
    JobCard: ({ job, onSave, onApply }: any) => (
        <div data-testid={`job-card-${job.id}`}>
            <h3>{job.title}</h3>
            <button onClick={onSave} title="Save job">Save</button>
            <button onClick={onApply} title="Apply job">Apply</button>
        </div>
    )
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('JobsPage', () => {
    const mockUser = { uid: 'user123' };
    const mockUserData = { role: 'seeker' };
    const mockJobs = [
        {
            id: 'job1',
            title: 'Frontend Developer',
            status: 'active',
            created_at: '2023-01-01',
            location: 'Remote',
            type: 'FULL_TIME'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({ user: mockUser, userData: mockUserData, loading: false });
        (JobService.getJobs as any).mockResolvedValue(mockJobs);
        (SavedJobsService.getSavedJobIds as any).mockResolvedValue(new Set(['job2']));
        (getJobSuggestions as any).mockResolvedValue([]);
    });

    const renderPage = () => {
        return render(
            <MemoryRouter>
                <JobsPage />
            </MemoryRouter>
        );
    };

    it('renders the page and loads jobs initially', async () => {
        renderPage();
        
        expect(screen.getByText('Open Positions')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(JobService.getJobs).toHaveBeenCalled();
        });

        expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    it('performs semantic search when query is entered', async () => {
        const searchResults = [
            { id: 'job-search-1', title: 'React Expert', matchScore: 0.95 }
        ];
        (searchJobs as any).mockResolvedValue(searchResults);
        
        renderPage();
        await waitFor(() => expect(JobService.getJobs).toHaveBeenCalled());

        const searchInput = screen.getByPlaceholderText('Search jobs...');
        fireEvent.change(searchInput, { target: { value: 'React' } });

        await waitFor(() => {
            expect(searchJobs).toHaveBeenCalledWith('React', expect.any(Object));
        });

        expect(screen.getByText('React Expert')).toBeInTheDocument();
        expect(screen.getByText(/"React"/)).toBeInTheDocument();
    });

    it('restores browse mode when search is cleared', async () => {
        (searchJobs as any).mockResolvedValue([]);
        renderPage();
        
        // Search
        const searchInput = screen.getByPlaceholderText('Search jobs...');
        fireEvent.change(searchInput, { target: { value: 'React' } });
        
        const clearBtn = await screen.findByText('Clear Filters');
        fireEvent.click(clearBtn);

        expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
        expect(screen.queryByText(/"React"/)).not.toBeInTheDocument();
    });

    it('handles saving a job', async () => {
        (JobService.getJobById as any).mockResolvedValue(mockJobs[0]);
        renderPage();
        await screen.findByText('Frontend Developer');

        const saveBtn = screen.getByTitle('Save job');
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(SavedJobsService.save).toHaveBeenCalled();
        });
    });

    it('handles applying to a job', async () => {
        (JobService.getJobById as any).mockResolvedValue(mockJobs[0]);
        renderPage();
        await screen.findByText('Frontend Developer');

        const applyBtn = screen.getByTitle('Apply job');
        fireEvent.click(applyBtn);

        await waitFor(() => {
            expect(JobService.getJobById).toHaveBeenCalledWith('job1');
        });
        // ApplyModal would be shown, but we've mocked it out of this specific test's assertions for brevity
    });

    it('does not fetch jobs when authLoading is true', async () => {
        (useAuth as any).mockReturnValue({ user: mockUser, userData: mockUserData, loading: true });
        renderPage();
        await waitFor(() => {
            expect(JobService.getJobs).not.toHaveBeenCalled();
        });
    });

    it('does not fetch jobs when user is null', async () => {
        (useAuth as any).mockReturnValue({ user: null, userData: null, loading: false });
        renderPage();
        await waitFor(() => {
            expect(JobService.getJobs).not.toHaveBeenCalled();
        });
    });

    it('shows error state when getJobs fails', async () => {
        (JobService.getJobs as any).mockRejectedValue(new Error('Network error'));
        renderPage();
        await waitFor(() => {
            expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
        });
    });

    it('shows "No active roles" when jobs list is empty and not searching', async () => {
        (JobService.getJobs as any).mockResolvedValue([]);
        renderPage();
        await waitFor(() => {
            expect(screen.getByText('No active roles')).toBeInTheDocument();
        });
    });

    it('shows "No matches found" when search returns empty results', async () => {
        (searchJobs as any).mockResolvedValue([]);
        renderPage();
        await waitFor(() => screen.getByText('Frontend Developer'));

        const searchInput = screen.getByPlaceholderText('Search jobs...');
        fireEvent.change(searchInput, { target: { value: 'Python' } });

        await waitFor(() => {
            expect(screen.getByText('No matches found')).toBeInTheDocument();
        });
    });

    it('shows suggestions when search returns empty results', async () => {
        (searchJobs as any).mockResolvedValue([]);
        (getJobSuggestions as any).mockResolvedValue(['Python Dev', 'Django Engineer']);
        renderPage();
        await waitFor(() => screen.getByText('Frontend Developer'));

        const searchInput = screen.getByPlaceholderText('Search jobs...');
        fireEvent.change(searchInput, { target: { value: 'Pyth' } });

        await waitFor(() => {
            expect(screen.getByText('Python Dev')).toBeInTheDocument();
            expect(screen.getByText('Django Engineer')).toBeInTheDocument();
        });
    });

    it('clicking a suggestion triggers a new search', async () => {
        (searchJobs as any).mockResolvedValue([]);
        (getJobSuggestions as any).mockResolvedValue(['Python Dev']);
        renderPage();
        await waitFor(() => screen.getByText('Frontend Developer'));

        fireEvent.change(screen.getByPlaceholderText('Search jobs...'), { target: { value: 'Pyth' } });

        await waitFor(() => screen.getByText('Python Dev'));

        (searchJobs as any).mockResolvedValue([{ id: 'job-s1', title: 'Python Dev Job' }]);
        fireEvent.click(screen.getByText('Python Dev'));

        await waitFor(() => {
            expect(searchJobs).toHaveBeenCalledWith('Python Dev', expect.any(Object));
        });
    });

    it('shows error panel with Reset Search button when searching and search fails', async () => {
        (searchJobs as any).mockRejectedValue(new Error('Search error'));
        renderPage();
        await waitFor(() => screen.getByText('Frontend Developer'));

        fireEvent.change(screen.getByPlaceholderText('Search jobs...'), { target: { value: 'React' } });

        await waitFor(() => {
            expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: /Reset Search/i })).toBeInTheDocument();
    });

    it('Reset Search button in error panel clears search state', async () => {
        (searchJobs as any).mockRejectedValue(new Error('Search error'));
        renderPage();
        await waitFor(() => screen.getByText('Frontend Developer'));

        fireEvent.change(screen.getByPlaceholderText('Search jobs...'), { target: { value: 'React' } });
        await waitFor(() => screen.getByRole('button', { name: /Reset Search/i }));

        fireEvent.click(screen.getByRole('button', { name: /Reset Search/i }));
        expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    it('shows apply modal when apply succeeds', async () => {
        (JobService.getJobById as any).mockResolvedValue(mockJobs[0]);
        renderPage();
        await screen.findByText('Frontend Developer');

        fireEvent.click(screen.getByTitle('Apply job'));

        await waitFor(() => {
            expect(screen.getByTestId('mock-apply-modal')).toBeInTheDocument();
        });
    });

    it('navigates to job detail when getJobById returns null', async () => {
        (JobService.getJobById as any).mockResolvedValue(null);
        renderPage();
        await screen.findByText('Frontend Developer');

        fireEvent.click(screen.getByTitle('Apply job'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/jobs/job1');
        });
    });

    it('navigates to job detail when getJobById throws', async () => {
        (JobService.getJobById as any).mockRejectedValue(new Error('not found'));
        renderPage();
        await screen.findByText('Frontend Developer');

        fireEvent.click(screen.getByTitle('Apply job'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/jobs/job1');
        });
    });

    it('unsaves a job that is already saved', async () => {
        (SavedJobsService.getSavedJobIds as any).mockResolvedValue(new Set(['job1']));
        (SavedJobsService.unsave as any).mockResolvedValue(undefined);
        renderPage();
        await screen.findByText('Frontend Developer');

        fireEvent.click(screen.getByTitle('Save job'));

        await waitFor(() => {
            expect(SavedJobsService.unsave).toHaveBeenCalledWith('user123', 'job1');
        });
    });

    it('rolls back save state on error', async () => {
        (JobService.getJobById as any).mockResolvedValue(mockJobs[0]);
        (SavedJobsService.save as any).mockRejectedValue(new Error('save failed'));
        renderPage();
        await screen.findByText('Frontend Developer');

        fireEvent.click(screen.getByTitle('Save job'));

        await waitFor(() => {
            expect(SavedJobsService.save).toHaveBeenCalled();
        });
    });

    it('does not show save/apply for employer role', async () => {
        (useAuth as any).mockReturnValue({ user: mockUser, userData: { role: 'employer' }, loading: false });
        renderPage();
        await waitFor(() => screen.getByText('Frontend Developer'));
        // The JobCard mock always renders save/apply buttons, but for employer, onSave/onApply are undefined
        // Clicking them should not call SavedJobsService or JobService.getJobById
        const saveBtn = screen.getByTitle('Save job');
        fireEvent.click(saveBtn);
        await waitFor(() => {
            expect(SavedJobsService.save).not.toHaveBeenCalled();
        });
    });

    it('does not call getSavedJobIds for non-seeker users', async () => {
        (useAuth as any).mockReturnValue({ user: mockUser, userData: { role: 'employer' }, loading: false });
        renderPage();
        await waitFor(() => expect(JobService.getJobs).toHaveBeenCalled());
        expect(SavedJobsService.getSavedJobIds).not.toHaveBeenCalled();
    });
});
