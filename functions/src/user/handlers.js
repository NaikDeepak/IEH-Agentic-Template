import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

export const onboardUser = async (req, res) => {
    const { role } = req.body;
    const uid = req.user?.uid;

    if (!uid) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!['seeker', 'employer'].includes(role)) {
        return res.status(400).json({ error: "Invalid role selection" });
    }

    try {
        const db = getFirestore();
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        // Check if role is already set
        if (userDoc.exists && userDoc.data().role) {
            return res.status(400).json({ error: "Role already assigned" });
        }

        // 1. Set Custom Claims in Firebase Auth
        await getAuth().setCustomUserClaims(uid, { role });

        // 2. Update Firestore document
        const updateData = {
            role,
            updated_at: FieldValue.serverTimestamp(),
            onboarded_at: FieldValue.serverTimestamp()
        };

        if (role === 'employer') {
            updateData.employerRole = 'owner';
        }

        if (!userDoc.exists) {
            // This case shouldn't happen with AuthProvider logic but good to handle
            await userRef.set({
                uid,
                email: req.user.email || null,
                displayName: req.user.name || null,
                photoURL: req.user.picture || null,
                ...updateData,
                created_at: FieldValue.serverTimestamp(),
                last_login: FieldValue.serverTimestamp()
            });
        } else {
            await userRef.update(updateData);
        }

        console.log(`User ${uid} successfully onboarded as ${role}`);
        res.json({ success: true, role });
    } catch (error) {
        console.error("Onboarding error:", error);
        res.status(500).json({ error: "Failed to onboard user", details: error.message });
    }
};
