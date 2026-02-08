import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Application, ApplicationStatus } from '../types';
import { ApplicantCard } from './ApplicantCard';

interface KanbanColumnProps {
  id: ApplicationStatus;
  title: string;
  applications: Application[];
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, applications }) => {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      <div className="flex items-center justify-between mb-4 border-b-4 border-black pb-2 px-2">
        <h3 className="font-black uppercase tracking-tighter text-lg">{title}</h3>
        <span className="bg-black text-white px-2 py-0.5 text-[10px] font-mono font-bold">
          {applications.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-grow min-h-[500px] bg-gray-50 border-2 border-dashed border-gray-200 p-3 flex flex-col gap-3 transition-colors hover:border-black"
      >
        <SortableContext
          items={applications.map(app => app.id ?? '')}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((application) => (
            <ApplicantCard key={application.id} application={application} />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="flex-grow flex items-center justify-center py-12 opacity-20">
             <p className="font-mono text-[10px] uppercase font-bold text-center">No Applicants</p>
          </div>
        )}
      </div>
    </div>
  );
};
