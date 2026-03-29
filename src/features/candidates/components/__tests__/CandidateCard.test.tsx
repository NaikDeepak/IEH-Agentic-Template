import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CandidateCard } from '../CandidateCard';
import type { CandidateSearchResult } from '../../../lib/ai/search';

describe('CandidateCard', () => {
  const mockCandidate: CandidateSearchResult = {
    uid: 'cand123',
    displayName: 'John Doe',
    jobTitle: 'Software Engineer',
    bio: 'Experienced developer with a passion for AI.',
    location: 'San Francisco, CA',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    matchScore: 85,
    photoURL: 'https://example.com/photo.jpg'
  };

  it('renders candidate information correctly', () => {
    render(<CandidateCard candidate={mockCandidate} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Experienced developer with a passion for AI.')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    expect(screen.getByAltText('John Doe')).toHaveAttribute('src', 'https://example.com/photo.jpg');
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('renders skills with limit', () => {
    render(<CandidateCard candidate={mockCandidate} />);

    // Should show first 5 skills
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
    
    // Docker should be hidden, showing +1 instead
    expect(screen.queryByText('Docker')).not.toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('handles skills as a CSV string', () => {
    const csvCandidate = {
      ...mockCandidate,
      skills: 'React, TypeScript, Node.js'
    };
    render(<CandidateCard candidate={csvCandidate as any} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('renders default values for missing information', () => {
    const minimalCandidate: any = {
      uid: 'cand456',
      skills: []
    };
    render(<CandidateCard candidate={minimalCandidate} />);

    expect(screen.getByText('Anonymous')).toBeInTheDocument();
    expect(screen.getByText('No bio available.')).toBeInTheDocument();
  });

  it('handles click event', () => {
    const onClick = vi.fn();
    render(<CandidateCard candidate={mockCandidate} onClick={onClick} />);

    // The card itself is the first button-like element
    const card = screen.getAllByRole('button')[0];
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard interaction (Enter)', () => {
    const onClick = vi.fn();
    render(<CandidateCard candidate={mockCandidate} onClick={onClick} />);

    const card = screen.getAllByRole('button')[0];
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard interaction (Space)', () => {
    const onClick = vi.fn();
    render(<CandidateCard candidate={mockCandidate} onClick={onClick} />);

    const card = screen.getAllByRole('button')[0];
    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies match score colors correctly', () => {
    const { rerender } = render(<CandidateCard candidate={{ ...mockCandidate, matchScore: 90 }} />);
    // getByText returns the span itself when it's the direct container
    expect(screen.getByText(/90%/)).toHaveClass('text-emerald-700');

    rerender(<CandidateCard candidate={{ ...mockCandidate, matchScore: 60 }} />);
    expect(screen.getByText(/60%/)).toHaveClass('text-amber-700');

    rerender(<CandidateCard candidate={{ ...mockCandidate, matchScore: 30 }} />);
    expect(screen.getByText(/30%/)).toHaveClass('text-slate-500');
  });
});
