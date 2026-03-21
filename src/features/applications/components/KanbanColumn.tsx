import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface KanbanColumnProps<T extends { id?: string }> {
  id: string;
  title: string;
  items: T[];
  renderCard: (item: T) => React.ReactNode;
}

export function KanbanColumn<T extends { id?: string }>({
  id,
  title,
  items,
  renderCard
}: KanbanColumnProps<T>) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  const validItems = items.filter((item): item is T & { id: string } => !!item.id);

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-sm text-slate-700">{title}</h3>
        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 text-[10px] font-semibold rounded-full">
          {items.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-grow min-h-[500px] bg-slate-100/60 border border-dashed border-slate-200 rounded-xl p-3 flex flex-col gap-2.5 transition-colors hover:border-sky-300 hover:bg-sky-50/40"
      >
        <SortableContext
          items={validItems.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {validItems.map((item) => (
            <React.Fragment key={item.id}>
              {renderCard(item)}
            </React.Fragment>
          ))}
        </SortableContext>

        {items.length === 0 && (
          <div className="flex-grow flex items-center justify-center py-12">
            <p className="text-xs text-slate-300 font-medium">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}
