import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '../../src/components/Footer';
import { MemoryRouter } from 'react-router-dom';

describe('Footer', () => {
    it('renders correctly', () => {
        const { container } = render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
        expect(container.textContent).toContain('WorkMila');
    });

    it('renders legal links', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
        expect(screen.getByText(/Privacy Policy/i)).toBeDefined();
        expect(screen.getByText(/Terms of Service/i)).toBeDefined();
    });
});
