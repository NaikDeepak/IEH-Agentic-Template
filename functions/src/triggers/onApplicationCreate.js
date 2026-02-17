
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { checkAndRewardReferrer } from "../growth/referral.js";
import * as Sentry from "@sentry/node";

export const onApplicationCreate = onDocumentCreated("applications/{appId}", async (event) => {
    // Sentry context if needed, though usually handled globally in index if initialized
    // But triggers run in separate instances, need to ensure Sentry captures errors here.

    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }

    const application = snapshot.data();
    const uid = application.candidate_id;

    if (!uid) {
        console.log("Application created without candidate_id");
        return;
    }

    try {
        await checkAndRewardReferrer(uid);
    } catch (error) {
        console.error("Error in onApplicationCreate referral check:", error);
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(error);
        }
    }
});
