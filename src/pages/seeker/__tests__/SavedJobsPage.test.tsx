import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SavedJobsPage } from '../SavedJobsPage';
import { MemoryRouter } from 'react-router-dom';
import { SavedJobsService } from '../../../features/seeker/services/savedJobsService';
import { useAuth } from '../../../hooks/useAuth';

// Mock dependencies
vi.mock('../../../hooks/useAuth');
vi.mock('../../../features/seeker/services/savedJobsService');
vi.mock('../../../components/Header', () => ({
    Header: () => <div data-testid="mock-header">Header</div>
}));
vi.mock('../../../components/ApplyModal', () => ({
    ApplyModal: ({ isOpen, onClose, job }: any) => isOpen ? (
        <div data-testid="mock-apply-modal">
            Apply for {job.title}
            <button onClick={onClose}>Close</button>
        </div>
    ) : null
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('SavedJobsPage', () => {
    const mockUser = { uid: 'user123' };
    const mockJobs = [
        {
            id: 'job1',
            title: 'Software Engineer',
            location: 'Remote',
            type: 'FULL_TIME',
            companyId: 'comp1'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({ user: mockUser });
        (SavedJobsService.getSavedBySeeker as any).mockResolvedValue(mockJobs);
    });

    const renderPage = () => {
        return render(
            <MemoryRouter>
                <SavedJobsPage />
            </MemoryRouter>
        );
    };

    it('renders the loading state and then the saved jobs', async () => {
        renderPage();
        
        expect(screen.getByText(/loading saved jobs/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(SavedJobsService.getSavedBySeeker).toHaveBeenCalledWith(mockUser.uid);
        });

        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
        expect(screen.getByText('Remote')).toBeInTheDocument();
    });

    it('shows empty state and navigates to jobs on click', async () => {
        (SavedJobsService.getSavedBySeeker as any).mockResolvedValue([]);
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('No saved jobs yet')).toBeInTheDocument();
        });

        const browseBtn = screen.getByRole('button', { name: /browse jobs/i });
        fireEvent.click(browseBtn);
        expect(mockNavigate).toHaveBeenCalledWith('/jobs');
    });

    it('navigates to job detail when a job is clicked', async () => {
        renderPage();
        const jobTitle = await screen.findByText('Software Engineer');
        fireEvent.click(jobTitle);

        expect(mockNavigate).toHaveBeenCalledWith('/jobs/job1');
    });

    it('handles unsaving a job', async () => {
        renderPage();
        const deleteBtn = await screen.findByTitle('Remove from saved');
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(SavedJobsService.unsave).toHaveBeenCalledWith(mockUser.uid, 'job1');
        });
        
        // Check that the job is removed from the list
        expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();
    });

    it('opens the apply modal when "Apply" is clicked', async () => {
        renderPage();
        const applyBtn = await screen.findByRole('button', { name: /apply/i });
        fireEvent.click(applyBtn);

        expect(screen.getByTestId('mock-apply-modal')).toBeInTheDocument();
        expect(screen.getByText('Apply for Software Engineer')).toBeInTheDocument();

        // Close modal
        fireEvent.click(screen.getByText('Close'));
        expect(screen.queryByTestId('mock-apply-modal')).not.toBeInTheDocument();
    });
});
