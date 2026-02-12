import { auth } from "../firebase";

/**
 * Helper to interact with the AI Proxy Cloud Function
 * Moves AI calls to the server to protect API keys.
 */
export const callAIProxy = async <T = unknown>(endpoint: string, body: unknown): Promise<T> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required for AI features.");

    const token = await user.getIdToken();
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorData.error ?? `AI Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
};
