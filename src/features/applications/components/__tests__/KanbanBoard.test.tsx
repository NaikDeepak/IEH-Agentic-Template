import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { KanbanBoard } from '../KanbanBoard';
import React from 'react';

// Define complex drag event types if needed, but we'll use 'any' for simplicity in mocks
type DragEventHandler = (event: any) => void;

let currentOnDragStart: DragEventHandler | undefined;
let currentOnDragOver: DragEventHandler | undefined;
let currentOnDragEnd: DragEventHandler | undefined;

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
    DndContext: ({ children, onDragStart, onDragOver, onDragEnd }: any) => {
        currentOnDragStart = onDragStart;
        currentOnDragOver = onDragOver;
        currentOnDragEnd = onDragEnd;
        return <div data-testid="dnd-context">{children}</div>;
    },
    DragOverlay: ({ children }: any) => <div data-testid="drag-overlay">{children}</div>,
    useSensor: vi.fn(),
    useSensors: vi.fn(),
    PointerSensor: {},
    KeyboardSensor: {},
    closestCorners: {},
    defaultDropAnimationSideEffects: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
    sortableKeyboardCoordinates: {},
}));

// Mock KanbanColumn
vi.mock('../KanbanColumn', () => ({
    KanbanColumn: ({ title, items, renderCard }: any) => (
        <div data-testid="kanban-column" data-title={title}>
            {items.map((item: any) => (
                <div key={item.id} data-testid="column-item">
                    {renderCard(item)}
                </div>
            ))}
        </div>
    ),
}));

// Helper for attribute selection
const getByAttribute = (attr: string, value: string) => {
    return document.querySelector(`[${attr}="${value}"]`) as HTMLElement;
};

describe('KanbanBoard', () => {
    const mockItems = [
        { id: '1', status: 'col-1', title: 'Item 1' },
        { id: '2', status: 'col-1', title: 'Item 2' },
        { id: '3', status: 'col-2', title: 'Item 3' },
    ];

    const mockColumns = [
        { id: 'col-1', title: 'Column 1' },
        { id: 'col-2', title: 'Column 2' },
    ];

    const mockOnStatusChange = vi.fn();
    const renderCard = (item: any) => <div data-testid="card">{item.title}</div>;
    const renderOverlayCard = (item: any) => <div data-testid="overlay-card">{item.title}</div>;

    beforeEach(() => {
        vi.clearAllMocks();
        currentOnDragStart = undefined;
        currentOnDragOver = undefined;
        currentOnDragEnd = undefined;
    });

    it('renders all columns and items correctly', () => {
        render(
            <KanbanBoard
                items={mockItems}
                columns={mockColumns}
                onStatusChange={mockOnStatusChange}
                renderCard={renderCard}
                renderOverlayCard={renderOverlayCard}
            />
        );

        const columns = screen.getAllByTestId('kanban-column');
        expect(columns).toHaveLength(2);
        expect(columns[0]).toHaveAttribute('data-title', 'Column 1');
        expect(columns[1]).toHaveAttribute('data-title', 'Column 2');
    });

    it('handles drag start, over column, and end', () => {
        render(
            <KanbanBoard
                items={mockItems}
                columns={mockColumns}
                onStatusChange={mockOnStatusChange}
                renderCard={renderCard}
                renderOverlayCard={renderOverlayCard}
            />
        );

        // 1. Start dragging Item 1
        act(() => {
            currentOnDragStart?.({ active: { id: '1' } });
        });
        expect(screen.getByTestId('drag-overlay')).toHaveTextContent('Item 1');

        // 2. Drag over Column 2
        act(() => {
            currentOnDragOver?.({ 
                active: { id: '1' }, 
                over: { id: 'col-2' } 
            });
        });
        // Check local state update: Item 1 should now be in Col 2 (internal state)
        const col2 = getByAttribute('data-title', 'Column 2');
        expect(col2.querySelectorAll('[data-testid="column-item"]')).toHaveLength(2);

        // 3. Drop
        act(() => {
            currentOnDragEnd?.({ 
                active: { id: '1' }, 
                over: { id: 'col-2' } 
            });
        });
        expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'col-2');
    });

    it('handles drag over another item', () => {
        render(
            <KanbanBoard
                items={mockItems}
                columns={mockColumns}
                onStatusChange={mockOnStatusChange}
                renderCard={renderCard}
                renderOverlayCard={renderOverlayCard}
            />
        );

        act(() => {
            currentOnDragStart?.({ active: { id: '1' } });
            // Drag Item 1 over Item 3 (which is in col-2)
            currentOnDragOver?.({ 
                active: { id: '1' }, 
                over: { id: '3' } 
            });
        });

        const col2 = getByAttribute('data-title', 'Column 2');
        expect(col2.querySelectorAll('[data-testid="column-item"]')).toHaveLength(2);
    });

    it('handles drag end with no destination (no changes)', () => {
        render(
            <KanbanBoard
                items={mockItems}
                columns={mockColumns}
                onStatusChange={mockOnStatusChange}
                renderCard={renderCard}
                renderOverlayCard={renderOverlayCard}
            />
        );

        act(() => {
            currentOnDragStart?.({ active: { id: '1' } });
            currentOnDragEnd?.({ active: { id: '1' }, over: null });
        });

        expect(mockOnStatusChange).not.toHaveBeenCalled();
    });

    it('handles drag end over same column (triggers change due to ID difference)', () => {
        render(
            <KanbanBoard
                items={mockItems}
                columns={mockColumns}
                onStatusChange={mockOnStatusChange}
                renderCard={renderCard}
                renderOverlayCard={renderOverlayCard}
            />
        );

        act(() => {
            currentOnDragStart?.({ active: { id: '1' } });
            // Dropping on column 1. active.id is '1'. over.id is 'col-1'.
            // Since '1' !== 'col-1', onStatusChange is called.
            currentOnDragEnd?.({ active: { id: '1' }, over: { id: 'col-1' } });
        });

        expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'col-1');
    });

    it('handles drag end over another item in different column', () => {
        render(
            <KanbanBoard
                items={mockItems}
                columns={mockColumns}
                onStatusChange={mockOnStatusChange}
                renderCard={renderCard}
                renderOverlayCard={renderOverlayCard}
            />
        );

        act(() => {
            currentOnDragStart?.({ active: { id: '1' } });
            currentOnDragEnd?.({ active: { id: '1' }, over: { id: '3' } });
        });

        expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'col-2');
    });

    it('handles drag end with non-existent activeId', () => {
        render(
            <KanbanBoard
                items={mockItems}
                columns={mockColumns}
                onStatusChange={mockOnStatusChange}
                renderCard={renderCard}
                renderOverlayCard={renderOverlayCard}
            />
        );

        act(() => {
            currentOnDragStart?.({ active: { id: '999' } });
            currentOnDragEnd?.({ active: { id: '999' }, over: { id: 'col-2' } });
        });

        expect(mockOnStatusChange).not.toHaveBeenCalled();
    });
});
