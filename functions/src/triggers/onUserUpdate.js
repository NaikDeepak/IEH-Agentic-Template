import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { getFirestore } from "firebase-admin/firestore";

/**
 * When a user document is created, updated, or deleted, keep the leaderboard
 * collection in sync. The leaderboard collection stores only the public subset:
 * uid, displayName, browniePoints, role — no PII or resume data.
 */
export const onUserUpdate = onDocumentWritten("users/{userId}", async (event) => {
    const db = getFirestore();
    const userId = event.params.userId;
    const leaderRef = db.collection("leaderboard").doc(userId);

    // User deleted — remove from leaderboard
    if (!event.data?.after?.exists) {
        await leaderRef.delete();
        return;
    }

    const after = event.data.after.data();
    const before = event.data.before?.data();

    // Only sync if the public leaderboard fields changed
    const brownieChanged = after?.browniePoints !== before?.browniePoints;
    const nameChanged = after?.displayName !== before?.displayName;
    const roleChanged = after?.role !== before?.role;

    if (!brownieChanged && !nameChanged && !roleChanged && event.data.before?.exists) {
        return;
    }

    await leaderRef.set({
        uid: userId,
        displayName: after?.displayName ?? '',
        browniePoints: typeof after?.browniePoints === 'number' ? after.browniePoints : 0,
        role: after?.role ?? 'seeker',
        updatedAt: new Date(),
    });
});
