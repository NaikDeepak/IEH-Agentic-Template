import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PopularTags } from '../PopularTags';
import React from 'react';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => {
            const { initial, animate, transition, whileHover, whileTap, ...rest } = props;
            return <button {...rest}>{children}</button>;
        },
    },
}));

describe('PopularTags', () => {
    it('renders popular label and all tags', () => {
        render(<PopularTags />);
        expect(screen.getByText(/Popular:/i)).toBeInTheDocument();
        expect(screen.getByText('Frontend Dev')).toBeInTheDocument();
        expect(screen.getByText('Product Manager')).toBeInTheDocument();
        expect(screen.getByText('Data Scientist')).toBeInTheDocument();
        expect(screen.getByText('Remote')).toBeInTheDocument();
        expect(screen.getByText('Startup')).toBeInTheDocument();
        expect(screen.getByText('UI/UX')).toBeInTheDocument();
    });

    it('renders the correct number of tag buttons', () => {
        render(<PopularTags />);
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(6);
    });
});
