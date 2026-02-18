import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Header } from '../../src/components/Header';
import { MemoryRouter } from 'react-router-dom';

// Mock Auth
vi.mock('../../src/hooks/useAuth', () => ({
    useAuth: () => ({
        userData: null,
        loading: false,
        signOut: vi.fn()
    })
}));

// Mock Login to avoid lazy loading issues
vi.mock('./Login', () => ({
    Login: () => <div data-testid="mock-login">Login</div>
}));

describe('Header', () => {
    it('renders correctly', () => {
        const { container } = render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );
        expect(container.textContent).toContain('IEH');
        expect(container.textContent).toContain('Find Jobs');
    });
});
