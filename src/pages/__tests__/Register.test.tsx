import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { Register } from '../Register';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

describe('Register Component', () => {
    const signupWithEmailMock = vi.fn();
    const clearErrorMock = vi.fn();

    const defaultAuthContext = {
        signupWithEmail: signupWithEmailMock,
        error: null,
        clearError: clearErrorMock,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as Mock).mockReturnValue(defaultAuthContext);
    });

    const renderRegister = () => {
        return render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
    };

    it('rendering of registration form elements', () => {
        renderRegister();

        expect(screen.getByRole('heading', { level: 2, name: /create account/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument(); // Name
        expect(screen.getByPlaceholderText(/john@example.com/i)).toBeInTheDocument(); // Email
        expect(screen.getAllByPlaceholderText(/••••••••/i)).toHaveLength(2); // Password and Confirm
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });

    it('updates input fields on user type', () => {
        renderRegister();

        const nameInput = screen.getByPlaceholderText(/john doe/i);
        const emailInput = screen.getByPlaceholderText(/john@example.com/i);
        const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
        const [passwordInput, confirmInput] = passwordInputs;

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        if (passwordInput) fireEvent.change(passwordInput, { target: { value: 'password123' } });
        if (confirmInput) fireEvent.change(confirmInput, { target: { value: 'password123' } });

        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInputs[0]).toHaveValue('password123');
        expect(passwordInputs[1]).toHaveValue('password123');
    });

    it('shows error when passwords do not match', () => {
        renderRegister();

        const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
        const [passwordInput, confirmInput] = passwordInputs;
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        if (passwordInput) fireEvent.change(passwordInput, { target: { value: 'password123' } });
        if (confirmInput) fireEvent.change(confirmInput, { target: { value: 'password456' } });

        fireEvent.click(submitButton);

        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        expect(signupWithEmailMock).not.toHaveBeenCalled();
    });

    it('calls signupWithEmail with correct data on valid submission', async () => {
        const signupPromise = Promise.resolve();
        signupWithEmailMock.mockReturnValue(signupPromise);

        renderRegister();

        const nameInput = screen.getByPlaceholderText(/john doe/i);
        const emailInput = screen.getByPlaceholderText(/john@example.com/i);
        const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
        const [passwordInput, confirmInput] = passwordInputs;
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
        if (passwordInput) fireEvent.change(passwordInput, { target: { value: 'SecurePass123' } });
        if (confirmInput) fireEvent.change(confirmInput, { target: { value: 'SecurePass123' } });

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(signupWithEmailMock).toHaveBeenCalledWith('jane@example.com', 'SecurePass123', 'Jane Doe');
        });
    });

    it('displays error from useAuth hook', () => {
        (useAuth as Mock).mockReturnValue({
            ...defaultAuthContext,
            error: 'Email already in use',
        });

        renderRegister();

        expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });
});
