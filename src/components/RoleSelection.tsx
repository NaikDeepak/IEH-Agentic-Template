import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserCheck, Building2, Loader2, ArrowRight } from 'lucide-react';
import { callAIProxy } from '../lib/ai/proxy';


export const RoleSelection: React.FC = () => {
    const { userData, user, refreshUserData } = useAuth();
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'seeker' | 'employer' | null>(null);

    const handleRoleSelect = async (role: 'seeker' | 'employer') => {
        if (!user || isUpdating) return;

        setIsUpdating(true);
        setSelectedRole(role);

        try {
            // 1. Call Onboarding API (Sets Custom Claims + Firestore Role)
            await callAIProxy('/api/user/onboard', { role });

            // 2. Force ID Token Refresh to get new Custom Claims
            await user.getIdToken(true);


            // 3. Sync React State
            await refreshUserData();
        } catch (error) {
            console.error("Onboarding error:", error);
            setIsUpdating(false);
            setSelectedRole(null);
            // Optional: Show error to user via toast/UI
        }
    };

    if (!userData || userData.role) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-sans">
            <div className="bg-white w-full max-w-3xl border-2 border-black shadow-[16px_16px_0px_0px_rgba(255,255,255,0.2)] p-8 md:p-12 relative animate-in fade-in zoom-in duration-300">

                {isUpdating && (
                    <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-12 h-12 text-black animate-spin" />
                        <p className="font-mono font-bold uppercase tracking-widest text-sm">Configuring Workspace...</p>
                    </div>
                )}

                <div className="text-center mb-12">
                    <div className="inline-block px-3 py-1 bg-black text-white font-mono text-xs font-bold uppercase tracking-widest mb-4">
                        Step 1 of 1
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">
                        Select Your Path
                    </h2>
                    <p className="font-mono text-gray-500 uppercase tracking-wide text-sm max-w-md mx-auto">
                        Choose how you will interact with the platform. This cannot be changed later.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Seeker Option */}
                    <button
                        onClick={() => handleRoleSelect('seeker')}
                        disabled={isUpdating}
                        className={`group relative p-8 border-2 border-black text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${selectedRole === 'seeker' ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'}`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <UserCheck className={`w-8 h-8 ${selectedRole === 'seeker' ? 'text-white' : 'text-black'}`} strokeWidth={1.5} />
                            <ArrowRight className={`w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity ${selectedRole === 'seeker' ? 'text-white' : 'text-black'}`} />
                        </div>
                        <h3 className={`text-2xl font-black uppercase tracking-tight mb-2 ${selectedRole === 'seeker' ? 'text-white' : 'text-black'}`}>
                            Candidate
                        </h3>
                        <p className={`font-mono text-xs font-bold uppercase tracking-wider leading-relaxed ${selectedRole === 'seeker' ? 'text-gray-400' : 'text-gray-500'}`}>
                            I want to find jobs, track applications, and access career tools.
                        </p>
                    </button>

                    {/* Employer Option */}
                    <button
                        onClick={() => handleRoleSelect('employer')}
                        disabled={isUpdating}
                        className={`group relative p-8 border-2 border-black text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${selectedRole === 'employer' ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'}`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <Building2 className={`w-8 h-8 ${selectedRole === 'employer' ? 'text-white' : 'text-black'}`} strokeWidth={1.5} />
                            <ArrowRight className={`w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity ${selectedRole === 'employer' ? 'text-white' : 'text-black'}`} />
                        </div>
                        <h3 className={`text-2xl font-black uppercase tracking-tight mb-2 ${selectedRole === 'employer' ? 'text-white' : 'text-black'}`}>
                            Employer
                        </h3>
                        <p className={`font-mono text-xs font-bold uppercase tracking-wider leading-relaxed ${selectedRole === 'employer' ? 'text-gray-400' : 'text-gray-500'}`}>
                            I want to post jobs, search talent, and manage hiring pipelines.
                        </p>
                    </button>
                </div>

            </div>
        </div>
    );
};
