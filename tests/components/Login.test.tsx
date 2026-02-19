import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Login } from '../../src/components/Login';
import { MemoryRouter } from 'react-router-dom';

// Mock Auth
vi.mock('../../src/hooks/useAuth', () => ({
    useAuth: () => ({
        loginWithGoogle: vi.fn(),
        loginWithEmail: vi.fn(),
        user: null,
        loading: false,
        logout: vi.fn(),
        error: null,
        clearError: vi.fn()
    })
}));

describe('Login', () => {
    it('renders correctly with form fields', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        // Use more flexible text matchers
        expect(screen.getByText(/Email Identity/i)).toBeDefined();
        expect(screen.getByText(/Passcode/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /Authenticate/i })).toBeDefined();
    });

    it('updates input values on change', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        // Find by label text or placeholder
        const emailInput = screen.getByPlaceholderText(/USER@EXAMPLE.COM/i) as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        expect(emailInput.value).toBe('test@example.com');
    });

    it('renders social login buttons', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        expect(screen.getByText(/Continue with Google/i)).toBeDefined();
    });
});
