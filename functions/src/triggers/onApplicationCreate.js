
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { checkAndRewardReferrer } from "../growth/referral.js";
import * as Sentry from "@sentry/node";

export const onApplicationCreate = onDocumentCreated("applications/{appId}", async (event) => {
    return Sentry.startSpan({
        op: "trigger.on-application-create",
        name: "Application Create Trigger"
    }, async (span) => {
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

        span.setAttribute("candidate_id", uid);

        try {
            await checkAndRewardReferrer(uid);
            span.setAttribute("referral_check", "success");
        } catch (error) {
            span.setAttribute("referral_check", "failed");
            console.error("Error in onApplicationCreate referral check:", error);
            if (process.env.SENTRY_DSN) {
                Sentry.captureException(error);
            }
        }
    });
});

