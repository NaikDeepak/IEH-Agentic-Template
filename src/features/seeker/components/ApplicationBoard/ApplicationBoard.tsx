import React from 'react';
import { KanbanBoard } from '../../../applications/components/KanbanBoard';
import { SeekerApplicationCard } from './SeekerApplicationCard';
import type { Application, ApplicationStatus } from '../../../applications/types';

interface SeekerApplicationBoardProps {
  applications: Application[];
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void;
}

const SEEKER_COLUMNS = [
  { id: 'applied', title: 'Applied' },
  { id: 'screening', title: 'Interviewing' },
  { id: 'offer', title: 'Offer' },
  { id: 'rejected', title: 'Rejected' },
];

export const ApplicationBoard: React.FC<SeekerApplicationBoardProps> = ({
  applications,
  onStatusChange
}) => {
  // Filter applications to only show those in our seeker-visible columns
  const visibleApplications = applications.filter((app: Application) =>
     
    SEEKER_COLUMNS.some(col => col.id === app.status)
  );

  return (
    <div className="mt-8">
      <KanbanBoard<Application>
        items={visibleApplications}
        columns={SEEKER_COLUMNS}
        onStatusChange={(id: string, status: string) => {
          onStatusChange(id, status as ApplicationStatus);
        }}

        renderCard={(app: Application) => (
           
          <SeekerApplicationCard application={app} />
        )}

        renderOverlayCard={(app: Application) => (
           
          <SeekerApplicationCard application={app} />
        )}
      />
    </div>
  );
};
