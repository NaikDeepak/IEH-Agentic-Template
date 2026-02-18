import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HowItWorks } from '../../src/components/HowItWorks';
import { MemoryRouter } from 'react-router-dom';

describe('HowItWorks', () => {
    it('renders correctly', () => {
        const { container } = render(
            <MemoryRouter>
                <HowItWorks />
            </MemoryRouter>
        );
        expect(container.textContent).toContain('How It');
        expect(container.textContent).toContain('Works');
        expect(container.textContent).toContain('Create Profile');
        expect(container.textContent).toContain('AI-Matched');
    });

    it('displays step numbers', () => {
        const { container } = render(
            <MemoryRouter>
                <HowItWorks />
            </MemoryRouter>
        );
        expect(container.textContent).toContain('01');
        expect(container.textContent).toContain('02');
    });
});
