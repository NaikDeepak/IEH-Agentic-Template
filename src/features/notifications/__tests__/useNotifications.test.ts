import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '../useNotifications';
import { NotificationsService } from '../notificationsService';
import { useAuth } from '../../../hooks/useAuth';

vi.mock('../../../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../notificationsService', () => ({
    NotificationsService: {
        subscribe: vi.fn(),
        markRead: vi.fn(),
        markAllRead: vi.fn(),
    },
}));

describe('useNotifications', () => {
    const mockUser = { uid: 'user-123' };
    const mockNotifications = [
        { id: '1', title: 'Notif 1', read: false },
        { id: '2', title: 'Notif 2', read: true },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({ user: mockUser });
    });

    it('subscribes to notifications on mount', () => {
        const unsubMock = vi.fn();
        (NotificationsService.subscribe as any).mockReturnValue(unsubMock);

        const { unmount } = renderHook(() => useNotifications());

        expect(NotificationsService.subscribe).toHaveBeenCalledWith('user-123', expect.any(Function));
        
        unmount();
        expect(unsubMock).toHaveBeenCalled();
    });

    it('updates notifications when service calls back', () => {
        let callback: (items: any[]) => void = () => {};
        (NotificationsService.subscribe as any).mockImplementation((_uid: string, cb: any) => {
            callback = cb;
            return vi.fn();
        });

        const { result } = renderHook(() => useNotifications());

        act(() => {
            callback(mockNotifications);
        });

        expect(result.current.notifications).toEqual(mockNotifications);
        expect(result.current.unreadCount).toBe(1);
    });

    it('marks a notification as read', async () => {
        (NotificationsService.markRead as any).mockResolvedValue(undefined);

        const { result } = renderHook(() => useNotifications());

        const response = await result.current.markRead('1');
        expect(response.success).toBe(true);
        expect(NotificationsService.markRead).toHaveBeenCalledWith('1');
    });

    it('handles markRead error', async () => {
        (NotificationsService.markRead as any).mockRejectedValue(new Error('Failed'));

        const { result } = renderHook(() => useNotifications());

        const response = await result.current.markRead('1');
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error.message).toBe('Failed');
        }
    });

    it('marks all as read', async () => {
        (NotificationsService.markAllRead as any).mockResolvedValue(undefined);

        const { result } = renderHook(() => useNotifications());

        const response = await result.current.markAllRead();
        expect(response.success).toBe(true);
        expect(NotificationsService.markAllRead).toHaveBeenCalledWith('user-123');
    });

    it('returns error if markAllRead called without user', async () => {
        (useAuth as any).mockReturnValue({ user: null });

        const { result } = renderHook(() => useNotifications());

        const response = await result.current.markAllRead();
        expect(response.success).toBe(false);
        if (!response.success) {
            expect(response.error.message).toBe('User not authenticated');
        }
    });
});
