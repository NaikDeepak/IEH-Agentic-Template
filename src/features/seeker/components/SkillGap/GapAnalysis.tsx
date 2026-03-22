import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { analyzeSkillGap } from '../../services/skillService';
import type { SkillGap } from '../../types';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Loader2, BookOpen, Video, FileText, CheckCircle, Target, ExternalLink, BookmarkPlus, AlertCircle } from 'lucide-react';

import { ProfileService } from '../../services/profileService';
import { getLatestResume } from '../../services/resumeService';

export const GapAnalysis: React.FC = () => {
    const { user } = useAuth();
    const [targetRole, setTargetRole] = useState('');
    const [currentSkills, setCurrentSkills] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<SkillGap | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [savedResources, setSavedResources] = useState<string[]>([]);
    const [dataSource, setDataSource] = useState<'profile' | 'user' | 'none'>('none');

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            try {
                // 1. Try to get data from seeker_profiles (synced from resume)
                const profile = await ProfileService.getProfile(user.uid);

                if (profile) {
                    if (profile.skills.length > 0) {
                        setCurrentSkills(profile.skills);
                        setDataSource('profile');
                    }
                    if (profile.preferences.roles.length > 0) {
                        const firstRole = profile.preferences.roles[0];
                        if (firstRole) {
                            setTargetRole(firstRole.toUpperCase());
                            if (profile.skills.length > 0) return; // Found everything we need
                        }
                    }
                }

                // 2. Fallback to users collection
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    if ((!profile || profile.skills.length === 0) && Array.isArray(data['skills'])) {
                        setCurrentSkills(data['skills'] as string[]);
                        setDataSource('user');
                    }
                    const prefs = data['preferences'] as { roles?: string[] } | undefined;
                    if (!targetRole && Array.isArray(prefs?.roles) && prefs.roles.length > 0) {
                        const firstRole = prefs.roles[0];
                        if (firstRole) {
                            setTargetRole(firstRole.toUpperCase());
                        }
                    }
                }

                // 3. Last ditch effort: Check resume analysis directly if targetRole still missing
                if (!targetRole) {
                    const latestResume = await getLatestResume(user.uid);
                    const experience = latestResume?.parsed_data.experience;
                    if (experience && experience.length > 0) {
                        const firstExp = experience[0];
                        if (firstExp) {
                            setTargetRole(firstExp.role.toUpperCase());
                            setDataSource('profile');
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching user data for gap analysis:", err);
            }
        };

        void fetchUserData();
    }, [user, targetRole]);

    const handleAnalyze = async () => {
        if (!user || !targetRole) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const gapAnalysis = await analyzeSkillGap(user.uid, currentSkills, targetRole);
            setResult(gapAnalysis);
            // Persist only the roles field — dot-path update avoids overwriting minSalary/locations/remote
            void ProfileService.updateProfileField(user.uid, 'preferences.roles', [targetRole]);
        } catch (err) {
            console.error(err);
            setError("Failed to analyze skill gap. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSaveResource = async (resource: { title: string; url: string }) => {
        if (!user) return;
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                saved_resources: arrayUnion(resource)
            });
            setSavedResources(prev => [...prev, resource.url]);
        } catch (err) {
            console.error("Error saving resource:", err);
        }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'video': return <Video size={16} />;
            case 'article': return <FileText size={16} />;
            default: return <BookOpen size={16} />;
        }
    };

    const getImportanceColor = (importance: string) => {
        switch (importance) {
            case 'high': return 'bg-red-50 text-red-700 border-red-100';
            case 'medium': return 'bg-amber-50 text-amber-700 border-amber-100';
            default: return 'bg-sky-50 text-sky-700 border-sky-100';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="border-b border-slate-200 pb-6">
                <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest">AI-Powered</span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">Skill Gap Analysis</h2>
                <p className="text-sm text-slate-400 mt-1">Discover the gap between your current skills and your target role.</p>
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full space-y-1.5">
                        <label htmlFor="target-role" className="block text-xs font-medium text-slate-500 uppercase tracking-widest">Target Role</label>
                        <div className="relative">
                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                id="target-role"
                                type="text"
                                value={targetRole}
                                onChange={(e) => { setTargetRole(e.target.value); }}
                                placeholder="e.g. Senior Frontend Engineer"
                                className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all text-sm text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !targetRole}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Analysing...
                            </>
                        ) : (
                            'Analyse Gap'
                        )}
                    </button>
                </div>

                {currentSkills.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-400">Your skills:</span>
                        {currentSkills.slice(0, 8).map((skill, i) => (
                            <span key={i} className="px-2.5 py-0.5 text-xs bg-slate-50 border border-slate-200 rounded-full text-slate-600">{skill}</span>
                        ))}
                        {currentSkills.length > 8 && (
                            <span className="text-xs text-slate-400">+{currentSkills.length - 8} more</span>
                        )}
                        {dataSource === 'profile' && (
                            <span className="ml-auto flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                                <FileText size={11} />
                                From resume
                            </span>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Missing Skills Column */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center">
                                        <Target size={13} className="text-red-500" />
                                    </span>
                                    Skills to Learn
                                </h3>
                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                    {result.missing_skills.length} identified
                                </span>
                            </div>

                            <div className="space-y-3">
                                {result.missing_skills.map((skill, index) => (
                                    <div key={index} className="bg-white rounded-xl border border-slate-200 shadow-soft p-4 hover:border-slate-300 hover:shadow-soft-md transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm font-semibold text-slate-900">{skill.name}</h4>
                                            <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-semibold capitalize ${getImportanceColor(skill.importance)}`}>
                                                {skill.importance}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-3">{skill.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Learning Resources Column */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center">
                                        <BookOpen size={13} className="text-emerald-600" />
                                    </span>
                                    Learning Resources
                                </h3>
                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                    {result.resources.length} resources
                                </span>
                            </div>

                            <div className="space-y-3">
                                {result.resources.map((resource, index) => (
                                    <div key={index} className="bg-white rounded-xl border border-slate-200 shadow-soft p-4 hover:border-slate-300 hover:shadow-soft-md transition-all">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
                                                        {getIconForType(resource.type)}
                                                        {resource.type}
                                                    </span>
                                                    {resource.skill_name && (
                                                        <span className="text-[10px] font-medium text-sky-700 bg-sky-50 border border-sky-100 rounded-full px-2 py-0.5">
                                                            {resource.skill_name}
                                                        </span>
                                                    )}
                                                </div>
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-semibold text-slate-900 hover:text-sky-700 flex items-center gap-1.5 transition-colors"
                                                >
                                                    <span className="truncate">{resource.title}</span>
                                                    <ExternalLink size={13} className="shrink-0" />
                                                </a>
                                            </div>
                                            <button
                                                onClick={() => handleSaveResource(resource)}
                                                disabled={savedResources.includes(resource.url)}
                                                className={`shrink-0 p-2 rounded-lg border transition-colors ${savedResources.includes(resource.url) ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-slate-200 text-slate-400 hover:border-sky-300 hover:text-sky-600'}`}
                                                title="Save resource"
                                            >
                                                {savedResources.includes(resource.url) ? <CheckCircle size={16} /> : <BookmarkPlus size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
