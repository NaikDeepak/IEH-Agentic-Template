import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { JobCard } from '../JobCard';
import type { Job } from '../../types';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../StatusBadge', () => ({
    StatusBadge: () => <span data-testid="status-badge" />,
}));

const mockNavigate = vi.fn();

const baseJob: Job = {
    id: 'job-1',
    title: 'Senior React Developer',
    employer_id: 'emp-1',
    description: 'Build amazing UIs',
    requirements: ['React', 'TypeScript'],
    status: 'active',
    type: 'full-time',
    location: 'Mumbai',
    salaryRange: { currency: '₹', min: 1200000, max: 2400000 },
    createdAt: { toDate: () => new Date('2024-01-01'), seconds: 0, nanoseconds: 0 } as any,
    expiresAt: undefined,
    skills: ['React', 'TypeScript'],
    embedding: null,
};

const renderCard = (props = {}) => render(
    <MemoryRouter>
        <JobCard job={baseJob} {...props} />
    </MemoryRouter>
);

describe('JobCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders job title', () => {
        renderCard();
        expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
    });

    it('renders location and type', () => {
        renderCard();
        expect(screen.getByText('Mumbai')).toBeInTheDocument();
        expect(screen.getByText('full time')).toBeInTheDocument();
    });

    it('renders formatted salary range', () => {
        renderCard();
        expect(screen.getByText(/1,200,000.*2,400,000/)).toBeInTheDocument();
    });

    it('shows match score badge when provided', () => {
        renderCard({ matchScore: 85 });
        expect(screen.getByText('85% Match')).toBeInTheDocument();
    });

    it('applies emerald color for match score >= 80', () => {
        renderCard({ matchScore: 85 });
        expect(screen.getByText('85% Match')).toHaveClass('text-emerald-700');
    });

    it('applies sky color for match score 50-79', () => {
        renderCard({ matchScore: 65 });
        expect(screen.getByText('65% Match')).toHaveClass('text-sky-700');
    });

    it('applies slate color for match score < 50', () => {
        renderCard({ matchScore: 30 });
        expect(screen.getByText('30% Match')).toHaveClass('text-slate-500');
    });

    it('does not show match score when not provided', () => {
        renderCard();
        expect(screen.queryByText(/% Match/)).not.toBeInTheDocument();
    });

    it('calls onClick when card is clicked', () => {
        const onClick = vi.fn();
        renderCard({ onClick });
        fireEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('navigates to job detail when no onClick provided', () => {
        renderCard();
        fireEvent.click(screen.getByRole('button'));
        expect(mockNavigate).toHaveBeenCalledWith('/jobs/job-1');
    });

    it('handles keyboard Enter', () => {
        const onClick = vi.fn();
        renderCard({ onClick });
        fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard Space', () => {
        const onClick = vi.fn();
        renderCard({ onClick });
        fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('shows save button when onSave is provided', () => {
        const onSave = vi.fn();
        renderCard({ onSave });
        expect(screen.getByTitle('Save job')).toBeInTheDocument();
    });

    it('calls onSave and stops propagation', () => {
        const onSave = vi.fn();
        const onClick = vi.fn();
        renderCard({ onSave, onClick });
        fireEvent.click(screen.getByTitle('Save job'));
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onClick).not.toHaveBeenCalled();
    });

    it('shows saved state with BookmarkCheck', () => {
        renderCard({ onSave: vi.fn(), isSaved: true });
        expect(screen.getByTitle('Remove from saved')).toBeInTheDocument();
    });

    it('shows onViewApplicants button when provided', () => {
        const onViewApplicants = vi.fn();
        renderCard({ onViewApplicants });
        expect(screen.getByText('Applicants')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Applicants'));
        expect(onViewApplicants).toHaveBeenCalledTimes(1);
    });

    it('shows onApply button when provided', () => {
        const onApply = vi.fn();
        renderCard({ onApply });
        expect(screen.getByText('Apply Now')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Apply Now'));
        expect(onApply).toHaveBeenCalledTimes(1);
    });

    it('shows "Active Hiring" label when status is active', () => {
        renderCard();
        expect(screen.getByText('Active Hiring')).toBeInTheDocument();
    });

    it('shows "Closed" label when status is not active', () => {
        renderCard({ job: { ...baseJob, status: 'closed' } });
        expect(screen.getByText('Closed')).toBeInTheDocument();
    });

    it('shows "JUST NOW" when createdAt is undefined', () => {
        renderCard({ job: { ...baseJob, createdAt: undefined } });
        expect(screen.getByText(/JUST NOW/)).toBeInTheDocument();
    });

    it('shows "JUST NOW" when createdAt is a non-Timestamp object (fallback to new Date)', () => {
        // Plain object (not instanceof Timestamp) → fallback to new Date() → JUST NOW
        renderCard({ job: { ...baseJob, createdAt: { toDate: () => new Date() } as any } });
        expect(screen.getByText(/JUST NOW/)).toBeInTheDocument();
    });

    it('renders without salaryRange', () => {
        renderCard({ job: { ...baseJob, salaryRange: undefined } });
        expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
    });
});
