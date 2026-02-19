import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JobCard } from '../../src/components/JobCard';
import { MemoryRouter } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('JobCard', () => {
    const mockJob: any = {
        id: 'job123',
        title: 'Senior Frontend Developer',
        location: 'San Francisco, CA',
        type: 'full-time',
        status: 'active',
        salaryRange: { currency: 'USD', min: 120000, max: 180000 },
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 86400000))
    };

    it('renders basic job information', () => {
        render(
            <MemoryRouter>
                <JobCard job={mockJob} />
            </MemoryRouter>
        );

        expect(screen.getByText('Senior Frontend Developer')).toBeInTheDocument();
        expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
        expect(screen.getByText('USD 120,000 - 180,000')).toBeInTheDocument();
        expect(screen.getByText(/Active Hiring/i)).toBeInTheDocument();
    });

    it('navigates to job details on click', () => {
        render(
            <MemoryRouter>
                <JobCard job={mockJob} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button'));
        expect(mockNavigate).toHaveBeenCalledWith('/jobs/job123');
    });

    it('shows match score when provided', () => {
        render(
            <MemoryRouter>
                <JobCard job={mockJob} matchScore={92} />
            </MemoryRouter>
        );

        expect(screen.getByText('92% Match')).toBeInTheDocument();
    });

    it('handles onViewApplicants correctly', () => {
        const handleView = vi.fn();
        render(
            <MemoryRouter>
                <JobCard job={mockJob} onViewApplicants={handleView} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText(/Applicants/i));
        expect(handleView).toHaveBeenCalled();
    });

    it('displays relative time for posted date', () => {
        const pastDate = new Date();
        pastDate.setHours(pastDate.getHours() - 5);
        const jobWithPastDate = { ...mockJob, createdAt: Timestamp.fromDate(pastDate) };

        render(
            <MemoryRouter>
                <JobCard job={jobWithPastDate} />
            </MemoryRouter>
        );

        expect(screen.getByText(/5H AGO/i)).toBeInTheDocument();
    });
});
