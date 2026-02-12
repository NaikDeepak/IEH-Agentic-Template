import { auth } from "../firebase";

/**
 * Helper to interact with the AI Proxy Cloud Function
 * Moves AI calls to the server to protect API keys.
 */
export const callAIProxy = async <T = unknown>(endpoint: string, body: unknown): Promise<T> => {
    const user = auth.currentUser;
    if (!user) {
        console.error("[AI Proxy] Authentication required but user is not signed in");
        throw new Error("Authentication required for AI features.");
    }

    // Force token refresh to ensure we always have a valid token
    const token = await user.getIdToken(true);

    console.warn("[AI Proxy] Making request to:", endpoint);
    console.warn("[AI Proxy] User ID:", user.uid);
    console.warn("[AI Proxy] Token length:", token.length);

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        console.error("[AI Proxy] Request failed:", {
            status: response.status,
            statusText: response.statusText,
            url: endpoint
        });

        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        const errorMessage = errorData.error ?? `AI Request failed with status ${response.status}`;

        console.error("[AI Proxy] Error details:", errorData);
        throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
};
