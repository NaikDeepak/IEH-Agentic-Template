import React, { useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { Linkedin, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

export const LinkedInVerification: React.FC = () => {
    const { user, userData, refreshUserData } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [profileUrl, setProfileUrl] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Basic validation
        // Robust URL validation
        // Robust URL validation
        const trimmedUrl = profileUrl.trim();

        let parsed: URL | null = null;
        try {
            parsed = new URL(trimmedUrl);
        } catch {
            setError('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)');
            return;
        }

        const host = parsed.hostname.toLowerCase();
        const isLinkedInHost = host === 'linkedin.com' || host.endsWith('.linkedin.com');
        const isHttps = parsed.protocol === 'https:';
        const isProfilePath = parsed.pathname.startsWith('/in/') && parsed.pathname.length > '/in/'.length;

        if (!isHttps || !isLinkedInHost || !isProfilePath) {
            setError('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)');
            return;
        }

        setError(null);
        setIsLoading(true);

        // Simulate OAuth / Profile Verification
        try {
            // In a real app, this would trigger a LinkedIn OAuth popup
            // For this prototype, we'll simulate the "Success" after a short delay
            await new Promise(resolve => { setTimeout(() => { resolve(true); }, 2000); });



            const token = await user.getIdToken();
            const response = await fetch('/api/user/verify-linkedin', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ profileUrl })
            });

            if (!response.ok) {
                const data = await response.json() as { error?: string };
                throw new Error(data.error ?? 'Failed to verify LinkedIn on server.');
            }

            await refreshUserData();
        } catch (err: unknown) {
            const error = err as { message?: string };
            console.error('LinkedIn verification error:', error);
            setError(error.message ?? 'Failed to verify LinkedIn profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (userData?.linkedinVerified) {
        return (
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-center gap-3">
                <div className="bg-sky-700 text-white p-1.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-sky-900">LinkedIn Verified</h3>
                    <p className="text-xs text-sky-600">Professional identity confirmed.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-[#0077B5] text-white p-1.5 rounded-lg">
                        <Linkedin className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">LinkedIn Verification</h3>
                        <p className="text-xs text-slate-400">Connect your professional network</p>
                    </div>
                </div>
                <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">Simulation</span>
            </div>

            <form onSubmit={handleVerify} className="space-y-3">
                <div className="space-y-1.5">
                    <label htmlFor="linkedin-url" className="block text-xs font-medium text-slate-500 uppercase tracking-widest">LinkedIn Profile URL</label>
                    <input
                        id="linkedin-url"
                        type="url"
                        value={profileUrl}
                        onChange={(e) => { setProfileUrl(e.target.value); }}
                        placeholder="https://linkedin.com/in/your-profile"
                        required
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all"
                    />
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-[#0077B5] hover:bg-[#006097] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <><ExternalLink className="w-3.5 h-3.5" /> Verify with LinkedIn</>
                    )}
                </button>
                <p className="text-[10px] text-slate-400 text-center">
                    Enter any valid LinkedIn URL to simulate verification.
                </p>
            </form>
        </div>
    );
};
