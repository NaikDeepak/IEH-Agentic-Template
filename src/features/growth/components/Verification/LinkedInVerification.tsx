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
            <div className="bg-blue-50 border-2 border-blue-600 p-6 flex items-center gap-4">
                <div className="bg-blue-600 text-white p-2 rounded-full">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-blue-900">LinkedIn Verified</h3>
                    <p className="text-xs font-mono font-bold text-blue-700 uppercase">Professional identity confirmed.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-[#0077B5] text-white p-2">
                        <Linkedin className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tight">LinkedIn Verification</h3>
                        <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Connect your professional network</p>
                    </div>
                </div>
                <div className="flex items-center px-2 py-1 bg-yellow-50 border border-yellow-200">
                    <span className="text-[8px] font-mono font-bold uppercase text-yellow-700">Simulation Mode</span>
                </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="linkedin-url" className="text-[10px] font-mono font-bold text-black uppercase tracking-widest">LinkedIn Profile URL</label>
                    <div className="relative">
                        <input
                            id="linkedin-url"
                            type="url"
                            value={profileUrl}
                            onChange={(e) => { setProfileUrl(e.target.value); }}
                            placeholder="https://linkedin.com/in/your-profile"
                            required
                            className="w-full px-4 py-3 bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none text-sm font-mono"
                        />
                    </div>
                </div>

                {error && <p className="text-[10px] font-mono font-bold text-red-600 uppercase">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-6 bg-[#0077B5] text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#0077B5] transition-all border-2 border-[#0077B5] flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <ExternalLink className="w-4 h-4" /> Verify with LinkedIn
                        </>
                    )}
                </button>
                <p className="text-[8px] font-mono font-bold text-gray-400 uppercase text-center mt-2">
                    Note: For this prototype, enter any valid LinkedIn URL to simulate verification.
                </p>
            </form>
        </div>
    );
};
