import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  doc,
  writeBatch,
  serverTimestamp,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "../../lib/firebase"
import type { AppNotification, NotificationType } from "./types"

const COL = "notifications"
const MAX_NOTIFICATIONS_PER_FETCH = 30

export const NotificationsService = {
  /** Subscribe to real-time notifications for a user (latest 30) */
  subscribe(userId: string, cb: (items: AppNotification[]) => void): Unsubscribe {
    const q = query(collection(db, COL), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(MAX_NOTIFICATIONS_PER_FETCH))
    return onSnapshot(q, (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: "estimate" }) }) as AppNotification))
    })
  },

  /**
   * Create a client-side notification.
   * Client writes are intentionally self-only; cross-user notifications must be
   * created by a trusted backend (Admin SDK / Cloud Function).
   */
  async create(
    actorUserId: string,
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
  ): Promise<void> {
    if (actorUserId !== userId) {
      throw new Error("Cross-user notifications are blocked on client. Use backend notification endpoint.")
    }

    await addDoc(collection(db, COL), {
      userId,
      type,
      title,
      message,
      read: false,
      link: link ?? null,
      createdAt: serverTimestamp(),
    })
  },

  /** Mark a single notification as read */
  async markRead(notifId: string): Promise<void> {
    await updateDoc(doc(db, COL, notifId), { read: true })
  },

  /** Mark all unread notifications for a user as read */
  async markAllRead(userId: string): Promise<void> {
    const q = query(collection(db, COL), where("userId", "==", userId), where("read", "==", false))
    const snap = await getDocs(q)
    if (snap.empty) return

    const unreadDocs = snap.docs
    for (let i = 0; i < unreadDocs.length; i += 500) {
      const batch = writeBatch(db)
      unreadDocs.slice(i, i + 500).forEach((d) => {
        batch.update(d.ref, { read: true })
      })
      await batch.commit()
    }
  },
}
