import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Testimonials } from '../../src/components/Testimonials';

describe('Testimonials', () => {
    it('renders correctly', () => {
        const { container } = render(<Testimonials />);
        expect(container.textContent).toContain('Impact');
        expect(container.textContent).toContain('Stories');
    });

    it('renders star ratings', () => {
        const { container } = render(<Testimonials />);
        expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
    });
});
