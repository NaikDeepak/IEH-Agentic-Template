import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KanbanColumn } from '../KanbanColumn';
import React from 'react';

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
    useDroppable: vi.fn(() => ({
        setNodeRef: vi.fn(),
    })),
}));

vi.mock('@dnd-kit/sortable', () => ({
    SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
    verticalListSortingStrategy: {},
}));

describe('KanbanColumn', () => {
    const mockItems = [
        { id: '1', title: 'Item 1' },
        { id: '2', title: 'Item 2' },
    ];

    const renderCard = (item: any) => <div data-testid="card">{item.title}</div>;

    it('renders title and item count', () => {
        render(
            <KanbanColumn
                id="col-1"
                title="To Do"
                items={mockItems}
                renderCard={renderCard}
            />
        );

        expect(screen.getByText('To Do')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders cards for each item', () => {
        render(
            <KanbanColumn
                id="col-1"
                title="To Do"
                items={mockItems}
                renderCard={renderCard}
            />
        );

        const cards = screen.getAllByTestId('card');
        expect(cards).toHaveLength(2);
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('renders "Drop here" when empty', () => {
        render(
            <KanbanColumn
                id="col-1"
                title="To Do"
                items={[]}
                renderCard={renderCard}
            />
        );

        expect(screen.getByText('Drop here')).toBeInTheDocument();
        expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    });

    it('excludes items without id', () => {
        const itemsWithInvalid = [
            { id: '1', title: 'Valid' },
            { title: 'Invalid' },
        ];

        render(
            <KanbanColumn
                id="col-1"
                title="To Do"
                items={itemsWithInvalid as any}
                renderCard={renderCard}
            />
        );

        const cards = screen.getAllByTestId('card');
        expect(cards).toHaveLength(1);
        expect(screen.getByText('Valid')).toBeInTheDocument();
        expect(screen.queryByText('Invalid')).not.toBeInTheDocument();
    });
});
