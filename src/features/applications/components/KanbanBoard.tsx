import React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps<T extends { id?: string; status: string }> {
  items: T[];
  columns: { id: string; title: string }[];
  onStatusChange: (id: string, newStatus: string) => void;
  renderCard: (item: T, isReadOnly?: boolean) => React.ReactNode;
  renderOverlayCard: (item: T, isReadOnly?: boolean) => React.ReactNode;
  isReadOnly?: boolean;
}

export function KanbanBoard<T extends { id?: string; status: string }>({
  items,
  columns,
  onStatusChange,
  renderCard,
  renderOverlayCard,
  isReadOnly = false
}: KanbanBoardProps<T>) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [localItems, setLocalItems] = React.useState<T[]>(items);

  React.useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeIdVal = active.id as string;
    const overIdVal = over.id as string;

    const activeItem = localItems.find((item) => item.id === activeIdVal);
    if (!activeItem) return;

    // Is it dropping over a column?
    const isOverAColumn = columns.some((col) => col.id === overIdVal);

    if (isOverAColumn) {
      const newStatus = overIdVal;
      if (activeItem.status !== newStatus) {
        setLocalItems((prev) =>
          prev.map((item) =>
            item.id === activeIdVal ? { ...item, status: newStatus } : item
          )
        );
      }
      return;
    }

    // Is it dropping over another card?
    const overItem = localItems.find((item) => item.id === overIdVal);
    if (overItem && activeItem.status !== overItem.status) {
      setLocalItems((prev) =>
        prev.map((item) =>
          item.id === activeIdVal ? { ...item, status: overItem.status } : item
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeIdVal = active.id as string;
    const overIdVal = over.id as string;

    const activeItem = localItems.find((item) => item.id === activeIdVal);
    if (!activeItem) {
      setActiveId(null);
      return;
    }

    let newStatus: string = activeItem.status;

    // If dropped over a column
    if (columns.some((col) => col.id === overIdVal)) {
      newStatus = overIdVal;
    } else {
      // If dropped over another item
      const overItem = localItems.find((item) => item.id === overIdVal);
      if (overItem) {
        newStatus = overItem.status;
      }
    }

    if (activeItem.status !== newStatus || activeIdVal !== overIdVal) {
      onStatusChange(activeIdVal, newStatus);
    }

    setActiveId(null);
  };

  const activeItem = activeId
    ? localItems.find((item) => item.id === activeId)
    : null;

  return (
    <DndContext
      sensors={isReadOnly ? [] : sensors}
      collisionDetection={closestCorners}
      onDragStart={!isReadOnly ? handleDragStart : undefined}
      onDragOver={!isReadOnly ? handleDragOver : undefined}
      onDragEnd={!isReadOnly ? handleDragEnd : undefined}
    >
      <div className="flex gap-6 overflow-x-auto pb-8 min-h-[600px] items-start">
        {columns.map((column) => (
          <KanbanColumn<T>
            key={column.id}
            id={column.id}
            title={column.title}
            items={localItems.filter((item) => item.status === column.id)}
            renderCard={(item) => renderCard(item, isReadOnly)}
          />
        ))}
      </div>

      {!isReadOnly && (
        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}
        >
          {activeItem ? renderOverlayCard(activeItem, isReadOnly) : null}
        </DragOverlay>
      )}
    </DndContext>
  );
}
