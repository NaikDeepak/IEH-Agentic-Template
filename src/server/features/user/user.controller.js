import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../../config/firebase.js";

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

/**
 * Mark the authenticated user's phone as verified.
 * Called after the client has confirmed the OTP via Firebase Auth.
 * Uses Admin SDK to write phoneVerified — blocked from client by Firestore rules.
 */
export const verifyPhone = async (req, res) => {
    const uid = req.user?.uid;

    if (!uid) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        if (userDoc.data().phoneVerified) {
            // Idempotent — already verified, nothing to do
            return res.json({ success: true, alreadyVerified: true });
        }

        await userRef.update({
            phoneVerified: true,
            phoneVerifiedAt: FieldValue.serverTimestamp(),
            // Award brownie points for first-time phone verification
            browniePoints: FieldValue.increment(25),
            updated_at: FieldValue.serverTimestamp()
        });

        console.log(`User ${uid} phone verified`);
        res.json({ success: true });
    } catch (error) {
        console.error("Phone verification error:", error);
        res.status(500).json({ error: "Failed to verify phone", details: error.message });
    }
};
