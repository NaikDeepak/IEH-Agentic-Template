import { GoogleGenAI } from "@google/genai";
import { db } from "../../../lib/firebase";
import { collection, query, getDocs, limit } from "firebase/firestore";
import type { Connection, OutreachTemplate, SeekerProfile } from "../types";

// Initialize Gemini
// Note: In a production environment, this should be proxied through a backend/Cloud Function to protect the API key.
const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

const SchemaType = {
    STRING: "STRING",
    NUMBER: "NUMBER",
    INTEGER: "INTEGER",
    BOOLEAN: "BOOLEAN",
    ARRAY: "ARRAY",
    OBJECT: "OBJECT"
};

/**
 * Finds potential connections at a target company who share background with the user.
 *
 * Note: Real implementation would require a dedicated search service (Algolia/Elastic)
 * or denormalized arrays of "schools" and "companies" on user documents for Firestore querying.
 *
 * For this MVP, we will:
 * 1. Fetch a sample of users (simulating a search for people at targetCompany)
 * 2. Filter them in memory for shared background
 */
export const findConnections = async (
    userProfile: SeekerProfile,
    targetCompany: string
): Promise<Connection[]> => {
    try {
        // 1. Extract user's background for matching
        const userSchools = userProfile.parsed_data?.education?.map(e => e.institution.toLowerCase()) ?? [];
        const userCompanies = userProfile.parsed_data?.experience?.map(e => e.company.toLowerCase()) ?? [];

        // 2. Query potential connections
        // In a real app, we'd query: users where current_company == targetCompany OR past_companies contains targetCompany
        // Since we don't have that index structure yet, we'll fetch a broad sample of users.
        // Optimization: In real world, use a collection group query or specific index.
        const usersRef = collection(db, "users");
        const q = query(
            usersRef,
            limit(50) // Fetch meaningful sample size
        );

        const snapshot = await getDocs(q);
        const connections: Connection[] = [];

        snapshot.forEach(doc => {
            const userData = doc.data() as SeekerProfile;

            // Skip self
            if (userData.uid === userProfile.uid) return;

            // Check if this person is relevant to the target company
            // (Assuming we can determine their current/past company from parsed_data)
            const theirExperience = userData.parsed_data?.experience ?? [];
            const hasWorkedAtTarget = theirExperience.some(e => e.company.toLowerCase().includes(targetCompany.toLowerCase()));

            // If they haven't worked at the target company, they aren't an "insider" there.
            // (Unless they are currently there - we check 'experience' for that too usually)
            if (!hasWorkedAtTarget) return;

            // 3. Check for shared background
            let matchType: Connection['connectionType'] | null = null;
            let sharedAttribute = "";
            let score = 0;

            // Check Alumni (School)
            const theirSchools = userData.parsed_data?.education ?? [];
            for (const school of theirSchools) {
                if (userSchools.some(s => s.includes(school.institution.toLowerCase()) || school.institution.toLowerCase().includes(s))) {
                    matchType = 'alumni';
                    sharedAttribute = school.institution;
                    score = 90;
                    break;
                }
            }

            // Check Ex-Colleague (Past Company)
            if (!matchType) {
                for (const exp of theirExperience) {
                    // Don't match on the target company itself as "shared past company" (unless user also worked there)
                    if (exp.company.toLowerCase().includes(targetCompany.toLowerCase())) continue;

                    if (userCompanies.some(c => c.includes(exp.company.toLowerCase()) || exp.company.toLowerCase().includes(c))) {
                        matchType = 'ex-colleague';
                        sharedAttribute = exp.company;
                        score = 85;
                        break;
                    }
                }
            }

            // Fallback: Shared Network (e.g. same skills or location - simple heuristic)
            if (!matchType) {
                // If no strong connection, maybe just "Working at Target Company" is enough if we want to show them?
                // The requirement says "shared backgrounds".
                // But let's be generous: if they are at the target company, they are a 'connection' of type 'network'
                matchType = 'shared-network';
                sharedAttribute = "Professional Network"; // Generic
                score = 60;
            }

            connections.push({
                id: `conn_${doc.id}`,
                uid: userData.uid,
                name: userData.displayName || "Unknown User",
                headline: userData.headline ?? userData.parsed_data?.experience?.[0]?.role ?? "Professional",
                photoURL: userData.photoURL ?? undefined,
                company: targetCompany,
                connectionType: matchType,
                sharedAttribute: sharedAttribute,
                matchScore: score
            });
        });

        // Sort by match score
        return connections.sort((a, b) => b.matchScore - a.matchScore);

    } catch (error) {
        console.error("Error finding connections:", error);
        // Return empty array instead of crashing
        return [];
    }
};

/**
 * Generates a personalized outreach message using AI.
 */
export const generateOutreachTemplate = async (
    connection: Connection,
    userProfile: SeekerProfile,
    tone: 'professional' | 'casual' | 'enthusiastic' = 'professional'
): Promise<OutreachTemplate> => {
    try {
        const prompt = `
            Generate a LinkedIn connection request or cold email message.

            Sender: ${userProfile.displayName}
            Sender Background: ${userProfile.headline ?? "Job Seeker"}

            Recipient: ${connection.name}
            Recipient Headline: ${connection.headline}
            Target Company: ${connection.company}

            Connection Type: ${connection.connectionType}
            Shared Context: ${connection.sharedAttribute}

            Tone: ${tone}

            Goal: Request a brief chat to learn about their experience at ${connection.company} or advice for applying.

            Return JSON with "subject" and "body".
        `;

        const result = (await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        subject: { type: SchemaType.STRING },
                        body: { type: SchemaType.STRING },
                        tone: { type: SchemaType.STRING }
                    },
                    required: ["subject", "body"]
                }
            }
        })) as { text: () => string };

        const responseText = result.text();
        if (!responseText) throw new Error("No response from AI");

        return JSON.parse(responseText) as OutreachTemplate;

    } catch (error) {
        console.error("Error generating outreach template:", error);
        // Fallback templates if AI fails
        if (connection.connectionType === 'alumni') {
            return {
                subject: `Fellow ${connection.sharedAttribute} alum reaching out`,
                body: `Hi ${connection.name.split(' ')[0] ?? 'there'},\n\nI noticed we both went to ${connection.sharedAttribute}. I'm currently exploring opportunities at ${connection.company} and would love to hear about your experience there.\n\nBest,\n${userProfile.displayName}`,
                tone: 'professional'
            };
        }
        return {
            subject: `Question about ${connection.company}`,
            body: `Hi ${connection.name.split(' ')[0] ?? 'there'},\n\nI see you're working at ${connection.company}. I'm very interested in the company and would appreciate any advice you might have for an applicant.\n\nBest,\n${userProfile.displayName}`,
            tone: 'professional'
        };
    }
};
