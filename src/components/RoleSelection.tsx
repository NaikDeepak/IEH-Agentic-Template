import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserCheck, Building2 } from 'lucide-react';

export const RoleSelection: React.FC = () => {
    const { userData, user, refreshUserData } = useAuth();

    const handleRoleSelect = async (role: 'seeker' | 'employer') => {
        if (!user) return;
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                role,
                updated_at: serverTimestamp()
            });
            // Manually refresh the user data in the context to update UI immediately
            await refreshUserData();
        } catch (error) {
            console.error("Error setting role:", error);
        }
    };

    if (!userData || userData.role) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 space-y-8 animate-in fade-in zoom-in duration-300">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">Choose Your Path</h2>
                    <p className="text-gray-600">Tell us how you'll be using India Employment Hub</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <button
                        onClick={() => handleRoleSelect('seeker')}
                        className="group p-6 border-2 border-gray-100 rounded-xl hover:border-indigo-600 hover:bg-indigo-50/50 transition-all duration-300 text-left space-y-4"
                    >
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">I'm a Candidate</h3>
                            <p className="text-sm text-gray-600">I'm looking for career opportunities and AI-powered interview prep.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleRoleSelect('employer')}
                        className="group p-6 border-2 border-gray-100 rounded-xl hover:border-emerald-600 hover:bg-emerald-50/50 transition-all duration-300 text-left space-y-4"
                    >
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">I'm an Employer</h3>
                            <p className="text-sm text-gray-600">I'm looking to hire top talent and streamline our recruitment pipeline.</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
