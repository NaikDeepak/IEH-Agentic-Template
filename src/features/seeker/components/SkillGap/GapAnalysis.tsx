import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { analyzeSkillGap } from '../../services/skillService';
import { SkillGap } from '../../types';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Loader2, BookOpen, Video, FileText, CheckCircle, Target, ExternalLink, BookmarkPlus } from 'lucide-react';

export const GapAnalysis: React.FC = () => {
    const { user } = useAuth();
    const [targetRole, setTargetRole] = useState('');
    const [currentSkills, setCurrentSkills] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<SkillGap | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [savedResources, setSavedResources] = useState<string[]>([]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) return;
            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                     
                    if (data.skills && Array.isArray(data.skills)) {
                         
                        setCurrentSkills(data.skills);
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    if (data.preferences?.roles && Array.isArray(data.preferences.roles) && data.preferences.roles.length > 0) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
                        setTargetRole(data.preferences.roles[0]);
                    }
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
            }
        };

        void fetchUserProfile();
    }, [user]);

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
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Skill Gap Analysis</h2>
                <p className="text-slate-600">Discover what's missing between your current skills and your dream role.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label htmlFor="target-role" className="block text-sm font-medium text-slate-700 mb-1">Target Role</label>
                        <div className="relative">
                            <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                id="target-role"
                                type="text"
                                value={targetRole}
                                onChange={(e) => { setTargetRole(e.target.value); }}
                                placeholder="e.g. Senior Frontend Developer"
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !targetRole}
                        className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                Analyze Gaps
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-4">
                     <p className="text-sm text-slate-500">
                        Based on your current skills: <span className="font-medium text-slate-700">{currentSkills.length > 0 ? currentSkills.join(', ') : 'None listed'}</span>
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Missing Skills Column */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs">!</span>
                                Missing Skills
                            </h3>
                            <div className="space-y-3">
                                {result.missing_skills.map((skill, index) => (
                                    <div key={index} className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-slate-900">{skill.name}</h4>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getImportanceColor(skill.importance)}`}>
                                                {skill.importance.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600">{skill.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Learning Plan Column */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs">✓</span>
                                Learning Plan
                            </h3>
                            <div className="space-y-3">
                                {result.resources.map((resource, index) => (
                                    <div key={index} className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-slate-400">{getIconForType(resource.type)}</span>
                                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{resource.type}</span>
                                                    {resource.skill_name && (
                                                        <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                                            for {resource.skill_name}
                                                        </span>
                                                    )}
                                                </div>
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group-hover:underline"
                                                >
                                                    {resource.title}
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                            <button
                                                onClick={() => handleSaveResource(resource)}
                                                disabled={savedResources.includes(resource.url)}
                                                className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${savedResources.includes(resource.url) ? 'text-green-500' : 'text-slate-400'}`}
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
