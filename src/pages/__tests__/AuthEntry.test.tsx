import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthEntry } from '../AuthEntry';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

describe('AuthEntry', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    it('renders login mode with correct heading and CTAs', () => {
        render(<MemoryRouter><AuthEntry mode="login" /></MemoryRouter>);
        expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
        expect(screen.getByText(/sign in as seeker/i)).toBeInTheDocument();
        expect(screen.getByText(/sign in as employer/i)).toBeInTheDocument();
    });

    it('renders register mode with correct heading and CTAs', () => {
        render(<MemoryRouter><AuthEntry mode="register" /></MemoryRouter>);
        expect(screen.getByRole('heading', { name: /join workmila/i })).toBeInTheDocument();
        expect(screen.getByText(/register as seeker/i)).toBeInTheDocument();
        expect(screen.getByText(/register as employer/i)).toBeInTheDocument();
    });

    it('navigates to /login/seeker when seeker card is clicked in login mode', () => {
        render(<MemoryRouter><AuthEntry mode="login" /></MemoryRouter>);
        const btn = screen.getByText(/i'm a job seeker/i).closest('button');
        if (btn) fireEvent.click(btn);
        expect(mockNavigate).toHaveBeenCalledWith('/login/seeker');
    });

    it('navigates to /login/employer when employer card is clicked in login mode', () => {
        render(<MemoryRouter><AuthEntry mode="login" /></MemoryRouter>);
        const btn = screen.getByText(/i'm an employer/i).closest('button');
        if (btn) fireEvent.click(btn);
        expect(mockNavigate).toHaveBeenCalledWith('/login/employer');
    });

    it('navigates to /register/seeker when seeker card is clicked in register mode', () => {
        render(<MemoryRouter><AuthEntry mode="register" /></MemoryRouter>);
        const btn = screen.getByText(/i'm a job seeker/i).closest('button');
        if (btn) fireEvent.click(btn);
        expect(mockNavigate).toHaveBeenCalledWith('/register/seeker');
    });

    it('navigates to /register/employer when employer card is clicked in register mode', () => {
        render(<MemoryRouter><AuthEntry mode="register" /></MemoryRouter>);
        const btn = screen.getByText(/i'm an employer/i).closest('button');
        if (btn) fireEvent.click(btn);
        expect(mockNavigate).toHaveBeenCalledWith('/register/employer');
    });

    it('shows "Create Account" link in login mode that navigates to /register', () => {
        render(<MemoryRouter><AuthEntry mode="login" /></MemoryRouter>);
        fireEvent.click(screen.getByText(/create account/i));
        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('shows "Sign In" link in register mode that navigates to /login', () => {
        render(<MemoryRouter><AuthEntry mode="register" /></MemoryRouter>);
        fireEvent.click(screen.getByText(/sign in/i));
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});
