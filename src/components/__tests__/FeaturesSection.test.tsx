import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FeaturesSection } from '../FeaturesSection';

describe('FeaturesSection', () => {
    it('renders key feature cards', () => {
        render(<FeaturesSection />);

        // Check for "Software Engineering" (Existing sector)
        expect(screen.getByText(/Software Engineering/i)).toBeInTheDocument();

        // Check for "Cloud & DevOps" (Existing sector)
        expect(screen.getByText(/Cloud & DevOps/i)).toBeInTheDocument();

    });
});
