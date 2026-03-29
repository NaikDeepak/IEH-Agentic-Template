import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../Header';

vi.mock('../../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../NotificationBell', () => ({
    NotificationBell: () => <div data-testid="notification-bell" />,
}));

vi.mock('../Login', () => ({
    Login: ({ variant }: { variant?: string }) => <div data-testid={`login-${variant}`} />,
}));

import { useAuth } from '../../hooks/useAuth';

const renderHeader = () => render(
    <MemoryRouter>
        <Header />
    </MemoryRouter>
);

describe('Header', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({ userData: null });
    });

    it('renders the WorkMila logo', () => {
        renderHeader();
        expect(screen.getByText('WorkMila')).toBeInTheDocument();
    });

    it('renders default nav for unauthenticated users', () => {
        renderHeader();
        expect(screen.getByText('Find Jobs')).toBeInTheDocument();
        expect(screen.getByText('Post a Job')).toBeInTheDocument();
        expect(screen.getByText('Pricing')).toBeInTheDocument();
    });

    it('renders seeker nav when role is seeker', () => {
        (useAuth as any).mockReturnValue({ userData: { role: 'seeker' } });
        renderHeader();
        expect(screen.getAllByText('Find Jobs').length).toBeGreaterThan(0);
        expect(screen.getAllByText('AI Prep').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    });

    it('renders employer nav when role is employer', () => {
        (useAuth as any).mockReturnValue({ userData: { role: 'employer' } });
        renderHeader();
        expect(screen.getAllByText('Find Talent').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Manage Jobs').length).toBeGreaterThan(0);
        expect(screen.getAllByText('My Company').length).toBeGreaterThan(0);
    });

    it('shows notification bell when user has a role', () => {
        (useAuth as any).mockReturnValue({ userData: { role: 'seeker' } });
        renderHeader();
        expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
    });

    it('hides notification bell when no role', () => {
        renderHeader();
        expect(screen.queryByTestId('notification-bell')).not.toBeInTheDocument();
    });

    it('opens mobile menu when toggle button is clicked', () => {
        renderHeader();
        const toggleBtn = screen.getByRole('button', { name: /open menu/i });
        fireEvent.click(toggleBtn);
        expect(screen.getByRole('navigation', { name: /mobile navigation/i })).toBeInTheDocument();
    });

    it('closes mobile menu when toggle is clicked again', () => {
        renderHeader();
        const toggleBtn = screen.getByRole('button', { name: /open menu/i });
        fireEvent.click(toggleBtn);
        fireEvent.click(screen.getByRole('button', { name: /close menu/i }));
        expect(screen.queryByRole('navigation', { name: /mobile navigation/i })).not.toBeInTheDocument();
    });

    it('updates aria-expanded when mobile menu opens', () => {
        renderHeader();
        const toggleBtn = screen.getByRole('button', { name: /open menu/i });
        expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(toggleBtn);
        expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute('aria-expanded', 'true');
    });
});
