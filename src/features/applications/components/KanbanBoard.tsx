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
import type { Application, ApplicationStatus } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { ApplicantCard } from './ApplicantCard';

interface KanbanBoardProps {
  applications: Application[];
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void;
}

const COLUMNS: { id: ApplicationStatus; title: string }[] = [
  { id: 'applied', title: 'Applied' },
  { id: 'screening', title: 'Screening' },
  { id: 'interview', title: 'Interview' },
  { id: 'offer', title: 'Offer' },
  { id: 'hired', title: 'Hired' },
  { id: 'rejected', title: 'Rejected' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ applications, onStatusChange }) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [localApplications, setLocalApplications] = React.useState<Application[]>(applications);

  React.useEffect(() => {
    setLocalApplications(applications);
  }, [applications]);

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

    const activeAppId = active.id as string;
    const overId = over.id as string;

    const activeApp = localApplications.find((app) => app.id === activeAppId);
    if (!activeApp) return;

    // Is it dropping over a column?
    const isOverAColumn = COLUMNS.some((col) => col.id === overId);

    if (isOverAColumn) {
      const newStatus = overId as ApplicationStatus;
      if (activeApp.status !== newStatus) {
        setLocalApplications((prev) =>
          prev.map((app) =>
            app.id === activeAppId ? { ...app, status: newStatus } : app
          )
        );
      }
      return;
    }

    // Is it dropping over another card?
    const overApp = localApplications.find((app) => app.id === overId);
    if (overApp && activeApp.status !== overApp.status) {
      setLocalApplications((prev) =>
        prev.map((app) =>
          app.id === activeAppId ? { ...app, status: overApp.status } : app
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

    const activeAppId = active.id as string;
    const overId = over.id as string;

    const activeApp = localApplications.find((app) => app.id === activeAppId);
    if (!activeApp) {
      setActiveId(null);
      return;
    }

    let newStatus: ApplicationStatus = activeApp.status;

    // If dropped over a column
    if (COLUMNS.some((col) => col.id === overId)) {
      newStatus = overId as ApplicationStatus;
    } else {
      // If dropped over another application
      const overApp = localApplications.find((app) => app.id === overId);
      if (overApp) {
        newStatus = overApp.status;
      }
    }

    if (activeApp.status !== newStatus || activeAppId !== overId) {
      onStatusChange(activeAppId, newStatus);
    }

    setActiveId(null);
  };

  const activeApplication = activeId
    ? localApplications.find((app) => app.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-8 min-h-[600px] items-start">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            applications={localApplications.filter((app) => app.status === column.id)}
          />
        ))}
      </div>

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
        {activeApplication ? <ApplicantCard application={activeApplication} /> : null}
      </DragOverlay>
    </DndContext>
  );
};
