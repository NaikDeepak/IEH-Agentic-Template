import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JobsPage } from '../../src/pages/JobsPage';
import { JobService } from '../../src/features/jobs/services/jobService';
import { searchJobs } from '../../src/lib/ai/search';
import { MemoryRouter } from 'react-router-dom';

// Mock Dependencies
vi.mock('../../src/features/jobs/services/jobService', () => ({
    JobService: {
        getJobs: vi.fn()
    }
}));

vi.mock('../../src/lib/ai/search', () => ({
    searchJobs: vi.fn()
}));

vi.mock('../../src/components/Header', () => ({
    Header: () => <div data-testid="header">Header</div>
}));

describe('JobsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        (JobService.getJobs as any).mockReturnValue(new Promise(() => { }));
        render(
            <MemoryRouter>
                <JobsPage />
            </MemoryRouter>
        );
        expect(screen.getByText(/Processing Data/i)).toBeDefined();
    });

    it('fetches and displays jobs', async () => {
        const mockJobs = [
            { id: '1', title: 'Developer', employer_id: 'emp1', location: 'Remote', status: 'active', created_at: new Date().toISOString() }
        ];
        (JobService.getJobs as any).mockResolvedValueOnce(mockJobs);

        render(
            <MemoryRouter>
                <JobsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Developer')).toBeDefined();
            expect(screen.getByText('Remote')).toBeDefined();
        });
    });

    it('handles search functionality', async () => {
        (JobService.getJobs as any).mockResolvedValueOnce([]);
        (searchJobs as any).mockResolvedValueOnce([
            { id: '2', title: 'React Expert', employer_id: 'emp1', location: 'NYC', status: 'active', matchScore: 95 }
        ]);

        render(
            <MemoryRouter>
                <JobsPage />
            </MemoryRouter>
        );

        const searchInput = screen.getByPlaceholderText(/Search/i);
        fireEvent.change(searchInput, { target: { value: 'React' } });

        const searchButton = screen.getByRole('button', { name: /Find/i });
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText('React Expert')).toBeDefined();
            expect(screen.getByText(/95%/)).toBeDefined();
        });
    });

    it('handles clear search', async () => {
        const mockJobs = [{ id: '1', title: 'Dev', employer_id: 'e1', location: 'Loc', status: 'active' }];
        (JobService.getJobs as any).mockResolvedValueOnce(mockJobs);
        (searchJobs as any).mockResolvedValueOnce([]);

        render(
            <MemoryRouter>
                <JobsPage />
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('Dev'));

        fireEvent.change(screen.getByPlaceholderText(/Search/i), { target: { value: 'test' } });
        fireEvent.click(screen.getByRole('button', { name: /Find/i }));

        await waitFor(() => expect(screen.queryByText('Dev')).toBeNull());

        const clearButton = await screen.findByRole('button', { name: /Clear Filters/i });
        fireEvent.click(clearButton);

        await waitFor(() => {
            expect(screen.getByText('Dev')).toBeDefined();
        });
    });
});
