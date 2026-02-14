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
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-6">
            {/* Header Section */}
            <div className="bg-white border-4 border-black p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="relative z-10 text-center">
                    <h2 className="text-5xl font-black text-black mb-4 uppercase tracking-tighter">Skill Gap Analysis</h2>
                    <p className="text-black font-mono font-bold uppercase tracking-tight max-w-2xl mx-auto">
                        Discover the delta between your current capabilities and your career goals.
                    </p>
                </div>
            </div>

            {/* Input Section */}
            <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full">
                        <label htmlFor="target-role" className="block text-xs font-black uppercase tracking-widest text-black mb-2">Target Career Path</label>
                        <div className="relative">
                            <Target className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black" size={20} />
                            <input
                                id="target-role"
                                type="text"
                                value={targetRole}
                                onChange={(e) => { setTargetRole(e.target.value); }}
                                placeholder="e.g. SENIOR FRONTEND ENGINEER"
                                className="w-full pl-12 pr-4 py-4 border-4 border-black font-mono font-bold uppercase placeholder:text-gray-400 focus:ring-0 focus:border-black transition-all"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !targetRole}
                        className="w-full md:w-auto px-10 py-5 bg-black text-white font-black uppercase tracking-tighter border-4 border-black hover:bg-white hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:translate-y-1 active:shadow-none"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                Calculate Delta
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t-2 border-dashed border-black">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <p className="text-xs font-mono font-bold uppercase text-black">
                            Current Inventory: <span className="bg-yellow-200 px-2 py-0.5">{currentSkills.length > 0 ? currentSkills.join(' ✦ ') : 'NONE REGISTERED'}</span>
                        </p>
                        {dataSource === 'profile' && (
                            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                                <FileText size={12} />
                                Derived from Resume
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-400 text-black p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold uppercase">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-6 h-6" />
                        {error}
                    </div>
                </div>
            )}

            {result && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="grid gap-10 md:grid-cols-2">
                        {/* Missing Skills Column */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b-4 border-black pb-2">
                                <h3 className="text-2xl font-black text-black uppercase tracking-tighter flex items-center gap-3">
                                    <span className="bg-red-500 text-white p-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <Target size={20} />
                                    </span>
                                    Skill Voids
                                </h3>
                                <span className="text-xs font-mono font-black border-2 border-black px-2 py-1 bg-black text-white">
                                    {result.missing_skills.length} DETECTED
                                </span>
                            </div>

                            <div className="space-y-4">
                                {result.missing_skills.map((skill, index) => (
                                    <div key={index} className="bg-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-xl font-black text-black uppercase tracking-tight">{skill.name}</h4>
                                            <span className={`px-3 py-1 border-2 border-black text-[10px] font-black uppercase tracking-widest ${getImportanceColor(skill.importance)}`}>
                                                {skill.importance}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-black border-l-4 border-black pl-4 py-1">{skill.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Learning Plan Column */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b-4 border-black pb-2">
                                <h3 className="text-2xl font-black text-black uppercase tracking-tighter flex items-center gap-3">
                                    <span className="bg-emerald-500 text-white p-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <BookOpen size={20} />
                                    </span>
                                    Bridge Assets
                                </h3>
                                <span className="text-xs font-mono font-black border-2 border-black px-2 py-1 bg-yellow-300">
                                    RESOURCES
                                </span>
                            </div>

                            <div className="space-y-4">
                                {result.resources.map((resource, index) => (
                                    <div key={index} className="bg-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="bg-black text-white p-1 border border-black">{getIconForType(resource.type)}</span>
                                                    <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">{resource.type}</span>
                                                    {resource.skill_name && (
                                                        <span className="text-[10px] font-black text-white bg-black px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                                                            FOR {resource.skill_name.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-lg font-bold text-black hover:bg-black hover:text-white px-1 -mx-1 flex items-center gap-2 transition-colors w-fit"
                                                >
                                                    {resource.title}
                                                    <ExternalLink size={18} />
                                                </a>
                                            </div>
                                            <button
                                                onClick={() => handleSaveResource(resource)}
                                                disabled={savedResources.includes(resource.url)}
                                                className={`p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-y-0.5 ${savedResources.includes(resource.url) ? 'bg-emerald-400' : 'bg-white hover:bg-black hover:text-white'}`}
                                                title="Save to checklist"
                                            >
                                                {savedResources.includes(resource.url) ? <CheckCircle size={20} /> : <BookmarkPlus size={20} />}
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
