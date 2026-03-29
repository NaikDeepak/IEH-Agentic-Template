import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PricingPage } from '../PricingPage';
import { MemoryRouter } from 'react-router-dom';

describe('PricingPage', () => {
    const renderPage = () => {
        return render(
            <MemoryRouter>
                <PricingPage />
            </MemoryRouter>
        );
    };

    it('renders seeker plans by default', () => {
        renderPage();
        expect(screen.getByText('Simple, transparent pricing')).toBeInTheDocument();
        expect(screen.getByText('For Job Seekers')).toBeInTheDocument();
        // Check for seeker plans
        expect(screen.getByText('Free')).toBeInTheDocument();
        expect(screen.getByText('Pro')).toBeInTheDocument();
        expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('switches to employer plans when tab is clicked', () => {
        renderPage();
        const employerButton = screen.getByRole('button', { name: /for employers/i });
        fireEvent.click(employerButton);

        // Check for employer plans
        expect(screen.getByText('Starter')).toBeInTheDocument();
        expect(screen.getByText('Growth')).toBeInTheDocument();
        expect(screen.getByText('Enterprise')).toBeInTheDocument();
        
        // Seeker plans should be gone (or at least the specific names from the list)
        expect(screen.queryByText('Free')).not.toBeInTheDocument();
    });

    it('renders price for plans with price and "Custom" for Enterprise', () => {
        renderPage();
        const employerButton = screen.getByRole('button', { name: /for employers/i });
        fireEvent.click(employerButton);

        // Starter price (2999)
        expect(screen.getByText(/2,999/)).toBeInTheDocument();
        // Enterprise price (null) should show 'Custom'
        expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    it('renders "Most Popular" badge for highlighted plans', () => {
        renderPage();
        // Pro is highlighted in Seeker plans
        expect(screen.getByText('Most Popular')).toBeInTheDocument();
        
        const employerButton = screen.getByRole('button', { name: /for employers/i });
        fireEvent.click(employerButton);
        // Growth is highlighted in Employer plans
        expect(screen.getByText('Most Popular')).toBeInTheDocument();
    });
});
