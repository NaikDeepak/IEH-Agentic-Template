import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import JobAlertsPage from '../JobAlertsPage';
import { MemoryRouter } from 'react-router-dom';
import { JobAlertsService } from '../../../features/notifications/jobAlertsService';
import { useAuth } from '../../../hooks/useAuth';

// Mock dependencies
vi.mock('../../../hooks/useAuth');
vi.mock('../../../features/notifications/jobAlertsService');
vi.mock('../../../components/Header', () => ({
    Header: () => <div data-testid="mock-header">Header</div>
}));

describe('JobAlertsPage', () => {
    const mockUser = { uid: 'user123' };
    const mockAlerts = [
        {
            id: 'alert1',
            keywords: 'React',
            location: 'Remote',
            jobType: 'FULL_TIME',
            active: true,
            createdAt: { toDate: () => new Date() }
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({ user: mockUser });
        (JobAlertsService.getAlerts as any).mockResolvedValue(mockAlerts);
    });

    const renderPage = () => {
        return render(
            <MemoryRouter>
                <JobAlertsPage />
            </MemoryRouter>
        );
    };

    it('renders the loading state and then the alerts', async () => {
        renderPage();
        
        // Wait for JobAlertsService.getAlerts to be called
        await waitFor(() => {
            expect(JobAlertsService.getAlerts).toHaveBeenCalledWith(mockUser.uid);
        });

        expect(screen.getByText('Job Alerts')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Remote')).toBeInTheDocument();
    });

    it('shows empty state when no alerts exist', async () => {
        (JobAlertsService.getAlerts as any).mockResolvedValue([]);
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('No alerts yet')).toBeInTheDocument();
        });
    });

    it('opens the create form when "New Alert" is clicked', async () => {
        renderPage();
        const newAlertBtn = await screen.findByText('New Alert');
        fireEvent.click(newAlertBtn);

        expect(screen.getByText('New Job Alert')).toBeInTheDocument();
        expect(screen.getByLabelText(/keywords/i)).toBeInTheDocument();
    });

    it('submits the form and refreshes the list', async () => {
        (JobAlertsService.createAlert as any).mockResolvedValue('new-alert-id');
        renderPage();
        
        // Open form
        const newAlertBtn = await screen.findByText('New Alert');
        fireEvent.click(newAlertBtn);

        // Fill form
        fireEvent.change(screen.getByLabelText(/keywords/i), { target: { value: 'Node.js' } });
        fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'Bangalore' } });
        
        const createBtn = screen.getByRole('button', { name: /create alert/i });
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(JobAlertsService.createAlert).toHaveBeenCalledWith(
                mockUser.uid, 'Node.js', 'Bangalore', ''
            );
            expect(JobAlertsService.getAlerts).toHaveBeenCalledTimes(2); // Initial and after create
        });
    });

    it('handles alert toggle', async () => {
        renderPage();
        await screen.findByText('React');

        const toggleBtn = screen.getByTitle('Pause alert');
        fireEvent.click(toggleBtn);

        expect(JobAlertsService.toggleAlert).toHaveBeenCalledWith('alert1', false);
    });

    it('handles alert deletion', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        renderPage();
        await screen.findByText('React');

        const deleteBtn = screen.getByTitle('Delete alert');
        fireEvent.click(deleteBtn);

        expect(JobAlertsService.deleteAlert).toHaveBeenCalledWith('alert1');
    });
});
