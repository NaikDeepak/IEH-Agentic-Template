import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApplicationBoard } from '../ApplicationBoard';
import React from 'react';

// Mock KanbanBoard to simplify testing
vi.mock('../../../../../features/applications/components/KanbanBoard', () => ({
    KanbanBoard: ({ items, columns, isReadOnly, onStatusChange, renderCard }: any) => (
        <div data-testid="kanban-board" data-readonly={isReadOnly}>
            <div data-testid="item-count">{items.length}</div>
            <div data-testid="column-count">{columns.length}</div>
            {items.map((item: any) => (
                <div key={item.id} data-testid="kanban-item">
                    {renderCard(item, isReadOnly)}
                </div>
            ))}
        </div>
    ),
}));

// Mock SeekerApplicationCard
vi.mock('../SeekerApplicationCard', () => ({
    SeekerApplicationCard: ({ application, isReadOnly }: any) => (
        <div data-testid="seeker-card" data-readonly={isReadOnly}>
            {application.candidate_role}
        </div>
    ),
}));

describe('ApplicationBoard', () => {
    const mockApplications: any[] = [
        { id: 'app-1', status: 'applied', candidate_role: 'Role 1' },
        { id: 'app-2', status: 'screening', candidate_role: 'Role 2' },
        { id: 'app-3', status: 'draft', candidate_role: 'Role 3' }, // Hidden
        { id: 'app-4', status: 'rejected', candidate_role: 'Role 4' },
    ];

    const mockOnStatusChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders KanbanBoard with filtered applications', () => {
        render(<ApplicationBoard applications={mockApplications} onStatusChange={mockOnStatusChange} />);

        const board = screen.getByTestId('kanban-board');
        expect(board).toBeInTheDocument();
        expect(board).toHaveAttribute('data-readonly', 'true');

        // Should only show applied, screening, offer, rejected
        // From mockApplications: 1, 2, 4 are visible. 3 is 'draft' (hidden).
        expect(screen.getByTestId('item-count')).toHaveTextContent('3');

        const cards = screen.getAllByTestId('seeker-card');
        expect(cards).toHaveLength(3);
        expect(cards[0]).toHaveAttribute('data-readonly', 'true');
    });

    it('defines correct seeker columns', () => {
        render(<ApplicationBoard applications={mockApplications} onStatusChange={mockOnStatusChange} />);
        expect(screen.getByTestId('column-count')).toHaveTextContent('4');
    });
});
