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
    Users,
    ChevronRight,
    Loader2,
    AlertCircle
} from 'lucide-react';

import { getLatestResume } from '../../features/seeker/services/resumeService';
import { getLatestSkillGap } from '../../features/seeker/services/skillService';
import { TrackerService } from '../../features/seeker/services/trackerService';
import { ShortlistFeed } from '../../features/seeker/components/Shortlist/ShortlistFeed';
import { MarketTrends } from '../../features/seeker/components/Market/MarketTrends';
import type { ResumeAnalysisResult, SkillGap } from '../../features/seeker/types';
import type { Application } from '../../features/applications/types';

export const SeekerDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [resume, setResume] = useState<ResumeAnalysisResult | null>(null);
    const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const [resumeData, gapData, appsData] = await Promise.all([
                    getLatestResume(user.uid),
                    getLatestSkillGap(user.uid),
                    TrackerService.getSeekerApplications(user.uid)
                ]);

                setResume(resumeData);
                setSkillGap(gapData);
                setApplications(appsData);
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
    const targetRole = (skillGap?.target_role ?? resume?.parsed_data.experience?.[0]?.role) ?? "Your Target Role";

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
                                <div className="border-2 border-black p-4 flex items-center gap-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <div className="bg-black p-2">
                                        <Briefcase className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black leading-none">{activeApplications.length}</div>
                                        <div className="text-[10px] font-bold uppercase text-gray-400">Active Apps</div>
                                    </div>
                                </div>
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

                            {/* 3. Skill Gap Quick View */}
                            <section className="border-4 border-black p-6 bg-indigo-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-6 h-6" />
                                        Skill Gap Analysis
                                    </h2>
                                    {skillGap ? (
                                        <div className="space-y-4">
                                            <p className="text-sm font-bold text-indigo-900 uppercase tracking-wide">
                                                Target: {skillGap.target_role}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {skillGap.missing_skills.slice(0, 3).map((skill, i) => (
                                                    <span key={i} className="bg-white border-2 border-black px-3 py-1 text-xs font-black uppercase">
                                                        {skill.name}
                                                    </span>
                                                ))}
                                                {skillGap.missing_skills.length > 3 && (
                                                    <span className="text-xs font-bold text-indigo-600">+{skillGap.missing_skills.length - 3} more</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => navigate('/seeker/skills')}
                                                className="mt-4 flex items-center gap-2 text-sm font-black uppercase underline decoration-2 underline-offset-4 hover:text-indigo-600"
                                            >
                                                View Learning Plan <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-4">
                                            <p className="text-sm text-gray-600 mb-4">Analyze your current skills against your target role.</p>
                                            <button
                                                onClick={() => navigate('/seeker/skills')}
                                                className="bg-black text-white px-6 py-2 text-sm font-black uppercase tracking-widest"
                                            >
                                                Analyze Gaps
                                            </button>
                                        </div>
                                    )}
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
                                            <span className="text-2xl font-black">{resume.score}</span>
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

                                <ToolLink
                                    icon={<Briefcase className="w-5 h-5" />}
                                    title="App Tracker"
                                    description="Kanban Board"
                                    onClick={() => navigate('/seeker/tracker')}
                                />
                            </section>

                            {/* 6. Upcoming Events / Nudges */}
                            <section className="bg-yellow-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <h2 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    Daily Nudge
                                </h2>
                                <p className="text-sm font-bold leading-tight">
                                    You have 2 applications that haven't been followed up on in over a week.
                                </p>
                                <button className="mt-4 text-xs font-black uppercase underline">
                                    Send Follow-ups
                                </button>
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
