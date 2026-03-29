import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeekerApplicationCard } from '../SeekerApplicationCard';
import { MemoryRouter } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import React from 'react';

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
    useSortable: vi.fn(),
}));

vi.mock('@dnd-kit/utilities', () => ({
    CSS: {
        Translate: {
            toString: vi.fn((t) => t ? `translate3d(${t.x}px, ${t.y}px, 0)` : ''),
        },
    },
}));

describe('SeekerApplicationCard', () => {
    const mockApplication: any = {
        id: 'app-1',
        job_id: 'job-123',
        candidate_role: 'Software Engineer',
        applied_at: new Date('2023-01-01').toISOString(),
        match_score: 85,
        needsFollowUp: true,
        nudgeReason: 'It has been 5 days since you applied.'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useSortable as any).mockReturnValue({
            attributes: {},
            listeners: {},
            setNodeRef: vi.fn(),
            transform: null,
            transition: null,
            isDragging: false,
        });
    });

    it('renders application details correctly', () => {
        render(<SeekerApplicationCard application={mockApplication} />, { wrapper: MemoryRouter });

        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
        expect(screen.getByText('85%')).toBeInTheDocument();
        expect(screen.getByText(/Applied 1\/1\/2023/i)).toBeInTheDocument();
        expect(screen.getByText(/It has been 5 days/i)).toBeInTheDocument();
    });

    it('renders placeholder for missing role', () => {
        const appNoRole = { ...mockApplication, candidate_role: undefined };
        render(<SeekerApplicationCard application={appNoRole} />, { wrapper: MemoryRouter });
        expect(screen.getByText('Position Applied')).toBeInTheDocument();
    });

    it('handles missing date gracefully', () => {
        const appNoDate = { ...mockApplication, applied_at: null };
        render(<SeekerApplicationCard application={appNoDate} />, { wrapper: MemoryRouter });
        expect(screen.getByText(/Applied Unknown/i)).toBeInTheDocument();
    });

    it('renders with drag styles when not read-only', () => {
        const { container } = render(<SeekerApplicationCard application={mockApplication} />, { wrapper: MemoryRouter });
        const cardDiv = container.firstChild as HTMLElement;
        expect(cardDiv.className).toContain('cursor-grab');
    });

    it('renders with default cursor styles when read-only', () => {
        const { container } = render(<SeekerApplicationCard application={mockApplication} isReadOnly={true} />, { wrapper: MemoryRouter });
        const cardDiv = container.firstChild as HTMLElement;
        expect(cardDiv.className).toContain('cursor-default');
    });

    it('navigates to job posting when link is clicked', () => {
        render(<SeekerApplicationCard application={mockApplication} />, { wrapper: MemoryRouter });
        const link = screen.getByLabelText(/View job posting/i);
        expect(link.getAttribute('href')).toBe('/jobs/job-123');
    });
});
