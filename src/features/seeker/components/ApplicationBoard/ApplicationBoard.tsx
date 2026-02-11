import React from 'react';
import { KanbanBoard } from '../../../features/applications/components/KanbanBoard';
import { SeekerApplicationCard } from './SeekerApplicationCard';
import type { Application, ApplicationStatus } from '../../../features/applications/types';

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          <SeekerApplicationCard application={app} />
        )}
         
        renderOverlayCard={(app: Application) => (
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          <SeekerApplicationCard application={app} />
        )}
      />
    </div>
  );
};
