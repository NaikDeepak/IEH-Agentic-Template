import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { NotificationBell } from '../NotificationBell';
import { useNotifications } from '../../features/notifications/useNotifications';
import { useNavigate } from 'react-router-dom';
import React from 'react';

// Mock Lucide icons for stable testing
vi.mock('lucide-react', () => ({
    Bell: () => <div data-testid="bell-icon" />,
    BriefcaseBusiness: () => <div data-testid="briefcase-icon" />,
    Sparkles: () => <div data-testid="sparkles-icon" />,
    Eye: () => <div data-testid="eye-icon" />,
    CheckCheck: () => <div data-testid="checkcheck-icon" />,
    CircleAlert: () => <div data-testid="circlealert-icon" />,
}));

vi.mock('../../features/notifications/useNotifications', () => ({
    useNotifications: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

describe('NotificationBell', () => {
    const mockNavigate = vi.fn();
    const mockMarkRead = vi.fn();
    const mockMarkAllRead = vi.fn();

    const mockNotifications = [
        { 
            id: '1', 
            type: 'application_status', 
            title: 'App Status', 
            message: 'Your application was updated', 
            read: false, 
            createdAt: Date.now() - 1000 * 60 * 5, // 5m ago
            link: '/tracker'
        },
        { 
            id: '2', 
            type: 'new_match', 
            title: 'New Match', 
            message: 'A new job matches your profile', 
            read: true, 
            createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2h ago
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
        vi.mocked(useNotifications).mockReturnValue({
            notifications: mockNotifications,
            unreadCount: 1,
            markRead: mockMarkRead,
            markAllRead: mockMarkAllRead,
        } as any);
    });

    it('renders the bell with unread count', () => {
        render(<NotificationBell />);
        expect(screen.getByLabelText(/Notifications \(1 unread\)/i)).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('opens the panel when clicked', () => {
        render(<NotificationBell />);
        fireEvent.click(screen.getByLabelText(/Notifications/));
        expect(screen.getByText('Notifications')).toBeInTheDocument();
        expect(screen.getByText('App Status')).toBeInTheDocument();
        expect(screen.getByText('New Match')).toBeInTheDocument();
    });

    it('marks all as read when button is clicked', async () => {
        render(<NotificationBell />);
        fireEvent.click(screen.getByLabelText(/Notifications/));
        
        const markAllBtn = screen.getByText(/Mark all read/i);
        fireEvent.click(markAllBtn);
        
        expect(mockMarkAllRead).toHaveBeenCalled();
    });

    it('handles individual notification click', async () => {
        render(<NotificationBell />);
        fireEvent.click(screen.getByLabelText(/Notifications/));
        
        const notifBtn = screen.getByText('App Status').closest('button');
        fireEvent.click(notifBtn!);
        
        expect(mockMarkRead).toHaveBeenCalledWith('1');
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/tracker');
        });
    });

    it('closes on outside click', async () => {
        render(<NotificationBell />);
        fireEvent.click(screen.getByLabelText(/Notifications/));
        expect(screen.getByText('Notifications')).toBeInTheDocument();

        // Simulate outside click
        fireEvent.mouseDown(document.body);
        
        expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });

    it('renders empty state when no notifications', () => {
        vi.mocked(useNotifications).mockReturnValue({
            notifications: [],
            unreadCount: 0,
            markRead: mockMarkRead,
            markAllRead: mockMarkAllRead,
        } as any);

        render(<NotificationBell />);
        fireEvent.click(screen.getByLabelText('Notifications'));
        expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    });

    it('handles different time formats correctly', () => {
        const notifs = [
            { 
                id: '1', 
                type: 'application_status', 
                title: 'T1', 
                message: 'M1', 
                read: false, 
                createdAt: { toDate: () => new Date(Date.now() - 5000) } // just now
            },
            { 
                id: '2', 
                type: 'new_match', 
                title: 'T2', 
                message: 'M2', 
                read: false, 
                createdAt: new Date(Date.now() - 1000 * 86400 * 2) // 2d ago
            }
        ];
        vi.mocked(useNotifications).mockReturnValue({
            notifications: notifs,
            unreadCount: 2,
            markRead: mockMarkRead,
            markAllRead: mockMarkAllRead,
        } as any);

        render(<NotificationBell />);
        fireEvent.click(screen.getByLabelText(/Notifications/));
        
        expect(screen.getByText('just now')).toBeInTheDocument();
        expect(screen.getByText('2d ago')).toBeInTheDocument();
    });
});
