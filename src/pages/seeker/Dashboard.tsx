import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../../components/Header';
import {
    FileText,
    Briefcase,
    TrendingUp,
    Video,
    ShieldCheck,
    ChevronRight,
    Loader2
} from 'lucide-react';

import { getLatestResume } from '../../features/seeker/services/resumeService';
import { getLatestSkillGap } from '../../features/seeker/services/skillService';
import { ProfileService } from '../../features/seeker/services/profileService';
import { TrackerService } from '../../features/seeker/services/trackerService';
import { ShortlistFeed } from '../../features/seeker/components/Shortlist/ShortlistFeed';
import { MarketTrends } from '../../features/seeker/components/Market/MarketTrends';
import type { ResumeAnalysisResult, SkillGap, SeekerProfile } from '../../features/seeker/types';
import type { Application } from '../../features/applications/types';
import { Edit3 } from 'lucide-react';

export const SeekerDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [resume, setResume] = useState<ResumeAnalysisResult | null>(null);
    const [profile, setProfile] = useState<SeekerProfile | null>(null);
    const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const [resumeData, profileData, gapData, appsData] = await Promise.all([
                    getLatestResume(user.uid),
                    ProfileService.getProfile(user.uid),
                    getLatestSkillGap(user.uid),
                    TrackerService.getSeekerApplications(user.uid)
                ]);

                setResume(resumeData);
                setProfile(profileData);
                setSkillGap(gapData);
                setApplications(appsData);

                // Auto-sync profile if it doesn't exist but resume does
                if (!profileData && resumeData) {
                    await ProfileService.syncFromResume(user.uid, resumeData);
                    const newProfile = await ProfileService.getProfile(user.uid);
                    setProfile(newProfile);
                }
            } catch (error) {
                console.error("Dashboard data fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        void fetchDashboardData();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-black mb-4" />
                <span className="font-mono font-black uppercase tracking-widest text-sm">Initializing Command Center...</span>
            </div>
        );
    }

    const activeApplications = applications.filter(app => app.status !== 'rejected' && app.status !== 'withdrawn');

    // Priority: Profile Target Role ?? Skill Gap Role ?? Resume Role
    const targetRole = profile?.preferences.roles[0] ?? skillGap?.target_role ?? resume?.parsed_data.experience?.[0]?.role ?? "Your Target Role";

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-black">
            <Header />

            <main className="flex-grow p-6 md:p-12">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Header */}
                    <header className="mb-12">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-6xl font-black uppercase tracking-tighter mb-2 italic">
                                    Command Center
                                </h1>
                                <p className="font-mono text-sm font-bold uppercase tracking-widest text-gray-500">
                                    Welcome back, {user?.displayName?.split(' ')[0] ?? 'Seeker'}.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate('/seeker/tracker')}
                                    className="border-2 border-black p-4 flex items-center gap-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group text-left relative overflow-hidden"
                                    aria-label={`View ${activeApplications.length} active applications in tracker`}
                                >
                                    <div className="bg-black p-2 group-hover:bg-indigo-600 transition-colors">
                                        <Briefcase className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-baseline gap-2">
                                            <div className="text-4xl font-black leading-none">{activeApplications.length}</div>
                                            <div className="text-[10px] font-bold uppercase text-gray-400">Active Apps</div>
                                        </div>
                                        <div className="flex gap-4 mt-1">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black leading-none text-emerald-600 uppercase">
                                                    {activeApplications.filter(a => a.status === 'interview').length}
                                                </span>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase">Interviewing</span>
                                            </div>
                                            <div className="flex flex-col border-l border-gray-200 pl-4">
                                                <span className="text-[10px] font-black leading-none text-indigo-600 uppercase">
                                                    {activeApplications.filter(a => a.status === 'applied').length}
                                                </span>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase">Applied</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 h-full w-1.5 bg-indigo-600 transform translate-x-full group-hover:translate-x-0 transition-transform"></div>
                                </button>
                            </div>
                        </div>
                        <div className="h-2 w-32 bg-black mt-8"></div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT COLUMN: Core Insights */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* 1. Daily Shortlist */}
                            <section className="border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                                <ShortlistFeed userId={user?.uid ?? ''} />
                            </section>

                            {/* 2. Market Trends */}
                            <section>
                                <MarketTrends role={targetRole} />
                            </section>

                            {/* 3. Professional Identity Card */}
                            <section className="border-4 border-black p-0 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 -mr-16 -mt-16 rotate-45 border-b-4 border-black group-hover:bg-emerald-400 transition-colors"></div>
                                <div className="p-8 relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-3xl font-black uppercase tracking-tighter">Professional Identity</h2>
                                                {profile?.verified_skills && profile.verified_skills.length > 0 && (
                                                    <span className="bg-emerald-400 p-1 border-2 border-black" title="Verified Profile">
                                                        <ShieldCheck className="w-5 h-5 text-black" />
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Target Role</p>
                                                <div className="inline-block bg-black text-white px-4 py-2 text-2xl font-black uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(16,185,129,0.5)]">
                                                    {targetRole}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-auto text-right space-y-4">
                                            <div className="inline-block text-left p-4 border-4 border-black bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                <p className="text-[10px] font-black uppercase tracking-widest mb-1">Profile Health</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-32 h-4 bg-white border-2 border-black p-0.5">
                                                        <div
                                                            className="h-full bg-black transition-all duration-1000"
                                                            style={{
                                                                width: `${((profile ? 20 : 0) +
                                                                    (resume ? 20 : 0) +
                                                                    (profile?.bio ? 20 : 0) +
                                                                    ((profile?.skills.length ?? 0) > 0 ? 20 : 0) +
                                                                    (profile?.preferences.roles.length ? 20 : 0))
                                                                    }%`
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="font-black text-lg">
                                                        {((profile ? 20 : 0) +
                                                            (resume ? 20 : 0) +
                                                            (profile?.bio ? 20 : 0) +
                                                            ((profile?.skills.length ?? 0) > 0 ? 20 : 0) +
                                                            (profile?.preferences.roles.length ? 20 : 0))}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate('/seeker/profile')}
                                                    className="px-6 py-2 border-4 border-black bg-white hover:bg-black hover:text-white font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all flex items-center gap-2"
                                                >
                                                    <Edit3 className="w-4 h-4" /> Edit Profile
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Bio / Headline */}
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Professional Narrative</p>
                                            <p className="font-bold leading-relaxed border-l-8 border-yellow-400 pl-6 italic bg-gray-50 py-4">
                                                {profile?.bio ?? "No professional summary added yet. Update your profile to stand out to employers."}
                                            </p>
                                        </div>

                                        {/* Top Skills section */}
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Core Expertise (Derived from Resume)</p>
                                            <div className="flex flex-wrap gap-2">
                                                {(profile?.skills ?? resume?.keywords.found ?? []).slice(0, 8).map((skill, i) => (
                                                    <span key={i} className="bg-white border-2 border-black px-3 py-1.5 text-xs font-black uppercase hover:bg-black hover:text-white transition-colors cursor-default">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {(profile?.skills.length ?? 0) === 0 && (resume?.keywords.found.length ?? 0) === 0 && (
                                                    <p className="text-sm font-bold text-gray-400 uppercase italic">No skills identified yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 pt-8 border-t-4 border-black flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 border-2 border-black ${resume ? 'bg-emerald-400' : 'bg-gray-200'}`}></div>
                                                <span className="text-[10px] font-black uppercase">Resume Linked</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 border-2 border-black ${profile?.skills.length ? 'bg-emerald-400' : 'bg-gray-200'}`}></div>
                                                <span className="text-[10px] font-black uppercase">Skills Mapped</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate('/seeker/skills')}
                                            className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white border-4 border-black font-black uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-3"
                                        >
                                            <TrendingUp className="w-5 h-5" />
                                            Open Gap Analysis
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN: Tools & Status */}
                        <div className="space-y-8">

                            {/* 4. Resume Score Card */}
                            <section className="border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                                <h2 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Resume Health
                                </h2>
                                {resume ? (
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-full border-4 border-black flex items-center justify-center bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <span className="text-2xl font-black">{Math.round(resume.score)}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase text-gray-500 mb-1">ATS Compatibility</p>
                                            <button
                                                onClick={() => navigate('/seeker/resume')}
                                                className="text-xs font-black uppercase underline hover:text-indigo-600"
                                            >
                                                Improve Resume
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-4 border-2 border-black border-dashed text-center">
                                        <p className="text-xs font-bold uppercase text-gray-400 mb-3">No Resume Analyzed</p>
                                        <button
                                            onClick={() => navigate('/seeker/resume')}
                                            className="bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-widest"
                                        >
                                            Upload Now
                                        </button>
                                    </div>
                                )}
                            </section>

                            {/* 5. Tool Navigator */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-black uppercase tracking-tight mb-4">Quick Tools</h2>

                                <ToolLink
                                    icon={<Video className="w-5 h-5" />}
                                    title="Interview Prep"
                                    description="AI Simulated Practice"
                                    onClick={() => navigate('/seeker/interview')}
                                />

                                {/* 
                                <ToolLink
                                    icon={<ShieldCheck className="w-5 h-5" />}
                                    title="Skill Proofs"
                                    description="Get Verified Badge"
                                    onClick={() => navigate('/seeker/assessments')}
                                />

                                <ToolLink
                                    icon={<Users className="w-5 h-5" />}
                                    title="Insider Connections"
                                    description="Network Matching"
                                    onClick={() => navigate('/seeker/networking')}
                                />
                                */}

                                <ToolLink
                                    icon={<Briefcase className="w-5 h-5" />}
                                    title="App Tracker"
                                    description="Kanban Board"
                                    onClick={() => navigate('/seeker/tracker')}
                                />
                            </section>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

interface ToolLinkProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const ToolLink: React.FC<ToolLinkProps> = ({ icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 border-2 border-black bg-white hover:bg-black hover:text-white transition-all group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-[-2px] translate-y-[-2px] hover:translate-x-0 hover:translate-y-0"
    >
        <div className="flex items-center gap-4 text-left">
            <div className="bg-black text-white p-2 group-hover:bg-white group-hover:text-black transition-colors">
                {icon}
            </div>
            <div>
                <div className="text-sm font-black uppercase tracking-tight">{title}</div>
                <div className="text-[10px] font-bold uppercase opacity-60 tracking-wider">{description}</div>
            </div>
        </div>
        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
);
