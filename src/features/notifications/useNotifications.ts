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
        await NotificationsService.markRead(id);
    };

    const markAllRead = async () => {
        if (!user) return;
        await NotificationsService.markAllRead(user.uid);
    };

    return { notifications, unreadCount, markRead, markAllRead };
}
