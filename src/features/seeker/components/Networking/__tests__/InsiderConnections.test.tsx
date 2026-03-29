import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InsiderConnections } from '../InsiderConnections';
import { findConnections, generateOutreachTemplate } from '../../../services/networkingService';
import { useAuth } from '../../../../../hooks/useAuth';
import { getDoc, doc, connectFirestoreEmulator } from 'firebase/firestore';
import React from 'react';

// Mock services and hooks
vi.mock('../../../services/networkingService', () => ({
  findConnections: vi.fn(),
  generateOutreachTemplate: vi.fn(),
}));

vi.mock('../../../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getDoc: vi.fn(),
  doc: vi.fn(),
  getFirestore: vi.fn(),
  connectFirestoreEmulator: vi.fn(),
}));

vi.mock('../../../../../lib/firebase', () => ({
  db: {},
}));

describe('InsiderConnections', () => {
  const mockUser = { uid: 'user-123' };
  const mockProfile = { id: 'user-123', name: 'Test Seeker' };
  const mockConnection: any = {
    id: 'conn-1',
    name: 'John Doe',
    headline: 'Software Engineer at Google',
    connectionType: 'alumni',
    sharedAttribute: 'Stanford University',
    photoURL: 'https://example.com/photo.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => mockProfile,
    } as any);
    vi.mocked(findConnections).mockResolvedValue([mockConnection]);
    vi.mocked(doc).mockReturnValue({} as any);
  });

  it('renders loading state initially', async () => {
    vi.mocked(findConnections).mockReturnValue(new Promise(() => {}));
    const { container } = render(<InsiderConnections companyName="Google" />);
    expect(container.querySelector('.animate-spin')).toBeDefined();
  });

  it('renders connections when found', async () => {
    render(<InsiderConnections companyName="Google" />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeDefined();
      expect(screen.getByText('Software Engineer at Google')).toBeDefined();
      expect(screen.getByText('Alumni')).toBeDefined();
      expect(screen.getByText(/Stanford University/)).toBeDefined();
    });
  });

  it('handles "no connections" state', async () => {
    vi.mocked(findConnections).mockResolvedValue([]);
    render(<InsiderConnections companyName="NonExistent" />);

    await waitFor(() => {
      expect(screen.getByText(/No insider connections found/i)).toBeInTheDocument();
    });
  });

  it('handles "user not found" error', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
    } as any);
    render(<InsiderConnections companyName="Google" />);

    await waitFor(() => {
      expect(screen.getByText(/User profile not found/i)).toBeInTheDocument();
    });
  });

  it('handles fetch error', async () => {
    vi.mocked(findConnections).mockRejectedValue(new Error('Fetch failed'));
    render(<InsiderConnections companyName="Google" />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load connections/i)).toBeInTheDocument();
    });
  });

  it('generates outreach template when Mail icon is clicked', async () => {
    const mockTemplate = { subject: 'Hello', body: 'This is a message.' };
    vi.mocked(generateOutreachTemplate).mockResolvedValue(mockTemplate as any);

    render(<InsiderConnections companyName="Google" />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const mailBtn = screen.getByTitle('Draft outreach message');
    fireEvent.click(mailBtn);

    await waitFor(() => {
      expect(screen.getByText(/Draft to John Doe/i)).toBeInTheDocument();
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('This is a message.')).toBeInTheDocument();
    });
  });

  it('copies template to clipboard', async () => {
    const mockTemplate = { subject: 'Hello', body: 'Body' };
    vi.mocked(generateOutreachTemplate).mockResolvedValue(mockTemplate as any);
    
    // Mock clipboard API
    const mockWriteText = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    render(<InsiderConnections companyName="Google" />);

    await waitFor(() => {
      fireEvent.click(screen.getByTitle('Draft outreach message'));
    });

    await waitFor(() => {
      const copyBtn = screen.getByText(/Copy to Clipboard/i);
      fireEvent.click(copyBtn);
    });

    expect(mockWriteText).toHaveBeenCalledWith('Subject: Hello\n\nBody');
    expect(screen.getByText(/Copied!/i)).toBeInTheDocument();
  });

  it('closes modal when X is clicked', async () => {
    vi.mocked(generateOutreachTemplate).mockResolvedValue({ subject: 'S', body: 'B' } as any);

    render(<InsiderConnections companyName="Google" />);

    await waitFor(() => {
      fireEvent.click(screen.getByTitle('Draft outreach message'));
    });

    await waitFor(() => {
      expect(screen.getByText(/Draft to John Doe/i)).toBeInTheDocument();
    });

    const xButton = screen.getAllByRole('button').find(b => b.querySelector('.lucide-x'));
    if (xButton) fireEvent.click(xButton);

    await waitFor(() => {
      expect(screen.queryByText(/Draft to John Doe/i)).not.toBeInTheDocument();
    });
  });
});
