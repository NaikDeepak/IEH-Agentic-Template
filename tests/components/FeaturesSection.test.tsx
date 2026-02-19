import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeaturesSection } from '../../src/components/FeaturesSection';

describe('FeaturesSection', () => {
    it('renders correctly', () => {
        const { container } = render(<FeaturesSection />);
        expect(container.textContent).toContain('Trending');
        expect(container.textContent).toContain('Sectors');
        expect(screen.getByText(/Software Engineering/i)).toBeDefined();
        expect(screen.getByText(/Cloud & DevOps/i)).toBeDefined();
        expect(screen.getByText(/Data Science & AI/i)).toBeDefined();
    });

    it('renders the wide ITES card', () => {
        render(<FeaturesSection />);
        expect(screen.getByText(/ITES & Business/i)).toBeDefined();
    });

    it('displays tags for sectors', () => {
        render(<FeaturesSection />);
        expect(screen.getByText(/Frontend/i)).toBeDefined();
        expect(screen.getByText(/MLOps/i)).toBeDefined();
    });
});
