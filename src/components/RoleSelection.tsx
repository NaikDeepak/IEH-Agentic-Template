import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { UserCheck, Building2, Loader2 } from 'lucide-react';

export const RoleSelection: React.FC = () => {
    const { userData, user, refreshUserData } = useAuth();
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'seeker' | 'employer' | null>(null);

    const handleRoleSelect = async (role: 'seeker' | 'employer') => {
        if (!user || isUpdating) return;

        setIsUpdating(true);
        setSelectedRole(role);

        try {
            const userDocRef = doc(db, 'users', user.uid);

            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);

                if (!userDoc.exists()) {
                    // Create doc with the selected role (now allowed by rules)
                    transaction.set(userDocRef, {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        role,
                        ...(role === 'employer' ? { employerRole: 'owner' } : {}),
                        created_at: serverTimestamp(),
                        updated_at: serverTimestamp(),
                        last_login: serverTimestamp()
                    });
                    return;
                }

                const data = userDoc.data() as { role?: string | null };
                // Only set the role if it's currently null or undefined
                if (!data.role) {
                    transaction.update(userDocRef, {
                        role,
                        ...(role === 'employer' ? { employerRole: 'owner' } : {}),
                        updated_at: serverTimestamp()
                    });
                }
            });

            // Manually refresh the user data in the context to update UI immediately
            await refreshUserData();
        } catch (error) {
            console.error("Error setting role:", error);
            setIsUpdating(false);
            setSelectedRole(null);
        }
    };

    if (!userData || userData.role) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 space-y-8 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
                {isUpdating && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                        <p className="text-lg font-medium text-slate-900">Setting up your profile...</p>
                    </div>
                )}

                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">Choose Your Path</h2>
                    <p className="text-slate-600">Tell us how you'll be using India Employment Hub</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <button
                        onClick={() => handleRoleSelect('seeker')}
                        disabled={isUpdating}
                        className={`group p-6 border-2 rounded-2xl transition-all duration-300 text-left space-y-4 relative ${selectedRole === 'seeker'
                                ? 'border-indigo-600 bg-indigo-50/50'
                                : 'border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/50'
                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selectedRole === 'seeker'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                            }`}>
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900">I'm a Candidate</h3>
                            <p className="text-sm text-slate-500">I'm looking for career opportunities and AI-powered interview prep.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleRoleSelect('employer')}
                        disabled={isUpdating}
                        className={`group p-6 border-2 rounded-2xl transition-all duration-300 text-left space-y-4 relative ${selectedRole === 'employer'
                                ? 'border-emerald-600 bg-emerald-50/50'
                                : 'border-slate-100 hover:border-emerald-600 hover:bg-emerald-50/50'
                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selectedRole === 'employer'
                                ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                                : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                            }`}>
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900">I'm an Employer</h3>
                            <p className="text-sm text-slate-500">I'm looking to hire top talent and streamline our recruitment pipeline.</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
