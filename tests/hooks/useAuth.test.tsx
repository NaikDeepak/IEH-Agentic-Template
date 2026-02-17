import { renderHook } from '@testing-library/react';
import { useAuth } from '../../src/hooks/useAuth';
import { AuthContext } from '../../src/context/AuthContext';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';

describe('useAuth', () => {
    it('should return context when used within provider', () => {
        const mockAuth = { user: { uid: '123' } } as any;
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthContext.Provider value={mockAuth}>
                {children}
            </AuthContext.Provider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });
        expect(result.current).toBe(mockAuth);
    });

    it('should throw error when used outside provider', () => {
        // Suppress console.error for expected error
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');

        consoleSpy.mockRestore();
    });
});
