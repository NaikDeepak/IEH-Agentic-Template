import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JobDetailModal } from '../JobDetailModal';
import React from 'react';

vi.mock('focus-trap-react', () => ({
    FocusTrap: ({ children }: any) => <>{children}</>,
}));

vi.mock('../StatusBadge', () => ({
    StatusBadge: ({ status }: any) => <span data-testid="status-badge">{status}</span>,
}));

const mockJob = {
    id: 'job-1',
    title: 'Senior React Engineer',
    description: 'Build great things with React.\nExciting work ahead.',
    skills: ['React', 'TypeScript', 'Node.js'],
    location: 'Bangalore',
    type: 'full_time',
    work_mode: 'hybrid',
    status: 'active',
    experience: '5+ years',
    salary_range: { min: 2000000, max: 3000000, currency: 'INR' },
    employer_id: 'emp-1',
    created_at: new Date(),
    updated_at: new Date(),
} as any;

describe('JobDetailModal', () => {
    it('returns null when closed', () => {
        const { container } = render(
            <JobDetailModal job={mockJob} isOpen={false} onClose={vi.fn()} onApply={vi.fn()} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders job details when open', () => {
        render(<JobDetailModal job={mockJob} isOpen={true} onClose={vi.fn()} onApply={vi.fn()} />);
        expect(screen.getByText('Senior React Engineer')).toBeInTheDocument();
        expect(screen.getByText('Bangalore')).toBeInTheDocument();
        expect(screen.getByText('5+ years')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Node.js')).toBeInTheDocument();
    });

    it('renders description paragraphs', () => {
        render(<JobDetailModal job={mockJob} isOpen={true} onClose={vi.fn()} onApply={vi.fn()} />);
        expect(screen.getByText('Build great things with React.')).toBeInTheDocument();
        expect(screen.getByText('Exciting work ahead.')).toBeInTheDocument();
    });

    it('renders salary range', () => {
        render(<JobDetailModal job={mockJob} isOpen={true} onClose={vi.fn()} onApply={vi.fn()} />);
        expect(screen.getByText(/2,000,000/)).toBeInTheDocument();
    });

    it('renders Apply Now button when not already applied', () => {
        render(<JobDetailModal job={mockJob} isOpen={true} onClose={vi.fn()} onApply={vi.fn()} />);
        expect(screen.getByRole('button', { name: /Apply Now/i })).toBeInTheDocument();
    });

    it('renders Already Applied message when alreadyApplied is true', () => {
        render(<JobDetailModal job={mockJob} isOpen={true} onClose={vi.fn()} onApply={vi.fn()} alreadyApplied={true} />);
        expect(screen.getByText('Already Applied')).toBeInTheDocument();
    });

    it('calls onApply when Apply Now is clicked', () => {
        const onApply = vi.fn();
        render(<JobDetailModal job={mockJob} isOpen={true} onClose={vi.fn()} onApply={onApply} />);
        fireEvent.click(screen.getByRole('button', { name: /Apply Now/i }));
        expect(onApply).toHaveBeenCalled();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(<JobDetailModal job={mockJob} isOpen={true} onClose={onClose} onApply={vi.fn()} />);
        // Close button is the X button
        const closeButton = screen.getAllByRole('button')[0];
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop is clicked', () => {
        const onClose = vi.fn();
        render(<JobDetailModal job={mockJob} isOpen={true} onClose={onClose} onApply={vi.fn()} />);
        const backdrop = screen.getByRole('presentation');
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed on dialog', () => {
        const onClose = vi.fn();
        render(<JobDetailModal job={mockJob} isOpen={true} onClose={onClose} onApply={vi.fn()} />);
        const dialog = screen.getByRole('dialog');
        fireEvent.keyDown(dialog, { key: 'Escape' });
        expect(onClose).toHaveBeenCalled();
    });

    it('shows Processing when isApplying is true', () => {
        render(<JobDetailModal job={mockJob} isOpen={true} onClose={vi.fn()} onApply={vi.fn()} isApplying={true} />);
        expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('renders Competitive when no salary range', () => {
        const jobNoSalary = { ...mockJob, salary_range: undefined };
        render(<JobDetailModal job={jobNoSalary} isOpen={true} onClose={vi.fn()} onApply={vi.fn()} />);
        expect(screen.getByText('Competitive')).toBeInTheDocument();
    });

    it('renders no skills section when skills array is empty', () => {
        const jobNoSkills = { ...mockJob, skills: [] };
        render(<JobDetailModal job={jobNoSkills} isOpen={true} onClose={vi.fn()} onApply={vi.fn()} />);
        expect(screen.queryByText('Required Skills')).not.toBeInTheDocument();
    });
});
