import * as Sentry from "@sentry/node";
import { getAI } from "../config.js";
import { ASSESSMENT_SCHEMA } from "../schemas.js";

export const generateAssessmentProxy = async (req, res) => {
    return Sentry.startSpan({
        op: "ai.assessment",
        name: "Generate Skill Assessment"
    }, async (span) => {
        try {
            const { systemPrompt, skill } = req.body;
            if (!systemPrompt || !skill || typeof skill !== 'string') {
                return res.status(400).json({ error: "Missing or invalid required fields" });
            }

            span.setAttribute("skill", skill);

            const ai = getAI();
            const result = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                systemInstruction: systemPrompt,
                contents: [{ role: "user", parts: [{ text: `Generate assessment for ${skill}` }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: ASSESSMENT_SCHEMA,
                }
            });

            const text = result.text;
            if (!text) throw new Error("AI returned empty response");

            res.json(JSON.parse(text));
        } catch (error) {
            console.error("Assessment Generation Error:", error);
            Sentry.captureException(error);
            res.status(500).json({ error: "Failed to generate assessment" });
        }
    });
};
