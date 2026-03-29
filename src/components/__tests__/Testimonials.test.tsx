import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Testimonials } from '../Testimonials';

describe('Testimonials', () => {
    it('renders the section heading', () => {
        render(<Testimonials />);
        expect(screen.getByText('Impact Stories')).toBeInTheDocument();
    });

    it('renders the first testimonial by default', () => {
        render(<Testimonials />);
        expect(screen.getByText('Thomas Karlow')).toBeInTheDocument();
        expect(screen.getByText('CEO, CAKAR INT.')).toBeInTheDocument();
    });

    it('shows employer persona badge for first testimonial', () => {
        render(<Testimonials />);
        expect(screen.getByText('Employer')).toBeInTheDocument();
    });

    it('navigates to next testimonial when Next button is clicked', () => {
        render(<Testimonials />);
        fireEvent.click(screen.getByRole('button', { name: /next testimonial/i }));
        expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    });

    it('shows "Job Seeker" persona for the second testimonial', () => {
        render(<Testimonials />);
        fireEvent.click(screen.getByRole('button', { name: /next testimonial/i }));
        expect(screen.getByText('Job Seeker')).toBeInTheDocument();
    });

    it('navigates to prev testimonial when Prev button is clicked (wraps around)', () => {
        render(<Testimonials />);
        // At index 0, going prev wraps to last (Rahul Mehta)
        fireEvent.click(screen.getByRole('button', { name: /previous testimonial/i }));
        expect(screen.getByText('Rahul Mehta')).toBeInTheDocument();
    });

    it('wraps from last to first testimonial on Next', () => {
        render(<Testimonials />);
        // Go to last
        fireEvent.click(screen.getByRole('button', { name: /next testimonial/i }));
        fireEvent.click(screen.getByRole('button', { name: /next testimonial/i }));
        // Now at last (Rahul Mehta)
        expect(screen.getByText('Rahul Mehta')).toBeInTheDocument();
        // Next wraps to first
        fireEvent.click(screen.getByRole('button', { name: /next testimonial/i }));
        expect(screen.getByText('Thomas Karlow')).toBeInTheDocument();
    });

    it('jumps to testimonial via dot navigation', () => {
        render(<Testimonials />);
        fireEvent.click(screen.getByRole('button', { name: /go to testimonial 3/i }));
        expect(screen.getByText('Rahul Mehta')).toBeInTheDocument();
    });

    it('shows the correct counter (1 / 3)', () => {
        render(<Testimonials />);
        expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('updates counter after navigation (2 / 3)', () => {
        render(<Testimonials />);
        fireEvent.click(screen.getByRole('button', { name: /next testimonial/i }));
        expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('renders 5 star icons', () => {
        render(<Testimonials />);
        // Each star has fill-amber-400 class
        const stars = document.querySelectorAll('.fill-amber-400');
        expect(stars.length).toBe(5);
    });
});
