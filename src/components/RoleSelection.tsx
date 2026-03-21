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
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
            <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-soft-md p-8 md:p-12 relative animate-in fade-in zoom-in-95 duration-200">

                {isUpdating && (
                    <div className="absolute inset-0 bg-white/90 z-20 rounded-2xl flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-8 h-8 text-sky-700 animate-spin" />
                        <p className="text-sm font-medium text-slate-500">Setting up your workspace...</p>
                    </div>
                )}

                <div className="text-center mb-10">
                    <span className="inline-block px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-200 mb-4">
                        One-time setup
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                        How will you use WorkMila?
                    </h2>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto">
                        Choose your role to personalise your experience. This cannot be changed later.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                    {/* Seeker Option */}
                    <button
                        onClick={() => handleRoleSelect('seeker')}
                        disabled={isUpdating}
                        className={`group relative p-8 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-soft-md ${selectedRole === 'seeker' ? 'border-sky-600 bg-sky-700 text-white' : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50'}`}
                    >
                        <div className="flex justify-between items-start mb-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedRole === 'seeker' ? 'bg-white/20' : 'bg-sky-50'}`}>
                                <UserCheck className={`w-6 h-6 ${selectedRole === 'seeker' ? 'text-white' : 'text-sky-700'}`} strokeWidth={1.5} />
                            </div>
                            <ArrowRight className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${selectedRole === 'seeker' ? 'text-white' : 'text-sky-600'}`} />
                        </div>
                        <h3 className={`text-xl font-bold mb-1.5 ${selectedRole === 'seeker' ? 'text-white' : 'text-slate-900'}`}>
                            I'm a Candidate
                        </h3>
                        <p className={`text-sm leading-relaxed ${selectedRole === 'seeker' ? 'text-sky-200' : 'text-slate-400'}`}>
                            Find jobs, track applications, and access AI career tools.
                        </p>
                    </button>

                    {/* Employer Option */}
                    <button
                        onClick={() => handleRoleSelect('employer')}
                        disabled={isUpdating}
                        className={`group relative p-8 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-soft-md ${selectedRole === 'employer' ? 'border-sky-600 bg-sky-700 text-white' : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50'}`}
                    >
                        <div className="flex justify-between items-start mb-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedRole === 'employer' ? 'bg-white/20' : 'bg-sky-50'}`}>
                                <Building2 className={`w-6 h-6 ${selectedRole === 'employer' ? 'text-white' : 'text-sky-700'}`} strokeWidth={1.5} />
                            </div>
                            <ArrowRight className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${selectedRole === 'employer' ? 'text-white' : 'text-sky-600'}`} />
                        </div>
                        <h3 className={`text-xl font-bold mb-1.5 ${selectedRole === 'employer' ? 'text-white' : 'text-slate-900'}`}>
                            I'm Hiring
                        </h3>
                        <p className={`text-sm leading-relaxed ${selectedRole === 'employer' ? 'text-sky-200' : 'text-slate-400'}`}>
                            Post jobs, search talent, and manage hiring pipelines.
                        </p>
                    </button>
                </div>

            </div>
        </div>
    );
};
