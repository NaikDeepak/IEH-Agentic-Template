import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { NotificationsService } from './notificationsService';
import type { AppNotification } from './types';

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    useEffect(() => {
        if (!user) return;
        const unsub = NotificationsService.subscribe(user.uid, items => {
            setNotifications(items);
        });
        return () => {
            unsub();
            setNotifications([]);
        };
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markRead = async (id: string) => {
        try {
            await NotificationsService.markRead(id);
            return { success: true as const };
        } catch (error) {
            return { success: false as const, error: error as Error };
        }
    };

    const markAllRead = async () => {
        if (!user) {
            return { success: false as const, error: new Error('User not authenticated') };
        }

        try {
            await NotificationsService.markAllRead(user.uid);
            return { success: true as const };
        } catch (error) {
            return { success: false as const, error: error as Error };
        }
    };

    return { notifications, unreadCount, markRead, markAllRead };
}
