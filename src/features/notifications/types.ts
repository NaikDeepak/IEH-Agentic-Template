import type { Timestamp } from 'firebase/firestore';

export type NotificationType =
    | 'application_status'
    | 'new_match'
    | 'profile_viewed';

export interface AppNotification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    link?: string;
    createdAt: Timestamp;
}
