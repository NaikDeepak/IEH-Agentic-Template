import * as Sentry from "@sentry/node";
import { getAI } from "../config.js";
import { SKILL_GAP_SCHEMA } from "../schemas.js";

export const analyzeSkillGapProxy = async (req, res) => {
    return Sentry.startSpan({
        op: "ai.skill-gap",
        name: "Analyze Skill Gap"
    }, async (span) => {
        try {
            const { prompt } = req.body;
            if (!prompt || typeof prompt !== 'string') {
                return res.status(400).json({ error: "Missing or invalid prompt" });
            }
            if (prompt.length > 10000) {
                return res.status(413).json({ error: "Prompt too large" });
            }

            span.setAttribute("prompt_length", prompt.length);

            const ai = getAI();
            const result = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: SKILL_GAP_SCHEMA,
                }
            });

            const text = result.text;
            if (!text) throw new Error("AI returned empty response");

            res.json(JSON.parse(text));
        } catch (error) {
            console.error("Skill Gap Analysis Error:", error);
            Sentry.captureException(error);
            res.status(500).json({ error: "Failed to analyze skill gap" });
        }
    });
};
