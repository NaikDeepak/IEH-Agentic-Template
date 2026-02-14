import * as Sentry from "@sentry/node";
import { getAI } from "../config.js";
import { RESUME_SCHEMA } from "../schemas.js";

export const analyzeResumeProxy = async (req, res) => {
    return Sentry.startSpan({
        op: "ai.resume-analysis",
        name: "Analyze Resume"
    }, async (span) => {
        try {
            const { promptParts, systemPrompt } = req.body;
            if (!promptParts || !Array.isArray(promptParts)) {
                return res.status(400).json({ error: "Missing or invalid promptParts" });
            }

            span.setAttribute("prompt_parts_count", promptParts.length);

            const ai = getAI();
            const result = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                systemInstruction: systemPrompt,
                contents: [{ role: "user", parts: promptParts }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: RESUME_SCHEMA,
                }
            });

            const text = result.text;
            if (!text) throw new Error("AI returned empty response");

            res.json(JSON.parse(text));
        } catch (error) {
            console.error("Resume Analysis Error:", error);
            Sentry.captureException(error);
            res.status(500).json({ error: "Failed to analyze resume" });
        }
    });
};
