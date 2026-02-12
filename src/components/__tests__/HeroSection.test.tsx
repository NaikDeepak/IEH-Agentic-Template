import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HeroSection } from '../HeroSection';

describe('HeroSection', () => {
    it('renders main headline and CTAs', () => {
        render(
            <MemoryRouter>
                <HeroSection />
            </MemoryRouter>
        );

        // Check for main heading parts
        expect(screen.getByText(/India/i)).toBeInTheDocument();
        expect(screen.getByText(/Employment/i)).toBeInTheDocument();
        expect(screen.getByText(/Hub/i)).toBeInTheDocument();

        // Check for sub-headline
        expect(screen.getByText(/Find your next career move/i)).toBeInTheDocument();

        // Check for CTAs
        expect(screen.getByPlaceholderText(/SEARCH ROLES\.\.\./i)).toBeInTheDocument();
        expect(screen.getByText(/Post a Job Free/i)).toBeInTheDocument();
    });
});
