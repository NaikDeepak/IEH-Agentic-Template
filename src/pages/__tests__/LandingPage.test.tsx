import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LandingPage } from '../LandingPage';

describe('LandingPage', () => {
    it('assembles the hero and feature sections', () => {
        render(<LandingPage />);

        // Check for Hero presence (Headline)
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Active/i);

        // Check for Feature section presence (One of the feature cards)
        expect(screen.getByText(/Active Ecosystem/i)).toBeInTheDocument();
    });
});
