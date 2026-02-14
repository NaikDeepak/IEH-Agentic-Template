import * as Sentry from "@sentry/node";
import { getAI } from "../config.js";
import { OUTREACH_SCHEMA } from "../schemas.js";

export const generateOutreachProxy = async (req, res) => {
    return Sentry.startSpan({
        op: "ai.outreach",
        name: "Generate Outreach Message"
    }, async (span) => {
        try {
            const { prompt } = req.body;
            if (!prompt || typeof prompt !== 'string') {
                return res.status(400).json({ error: "Missing or invalid prompt" });
            }

            span.setAttribute("prompt_length", prompt.length);

            const ai = getAI();
            const result = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: OUTREACH_SCHEMA,
                }
            });

            const text = result.text;
            if (!text) throw new Error("AI returned empty response");

            res.json(JSON.parse(text));
        } catch (error) {
            console.error("Outreach Generation Error:", error);
            Sentry.captureException(error);
            res.status(500).json({ error: "Failed to generate outreach message" });
        }
    });
};
