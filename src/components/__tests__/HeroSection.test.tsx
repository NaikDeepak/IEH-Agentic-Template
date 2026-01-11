import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroSection } from '../HeroSection';

describe('HeroSection', () => {
    it('renders main headline and CTAs', () => {
        render(<HeroSection />);

        // Check for "Active" keyword in headline (Core Differentiator)
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Active/i);

        // Check for CTA Buttons
        expect(screen.getByRole('button', { name: /Start Hiring/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /How it works/i })).toBeInTheDocument();
    });
});
