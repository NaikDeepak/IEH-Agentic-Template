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
    Gift,
    Bookmark,
    Bell,
} from 'lucide-react';

import { getLatestResume } from '../../features/seeker/services/resumeService';
import { getLatestSkillGap } from '../../features/seeker/services/skillService';
import { ProfileService } from '../../features/seeker/services/profileService';
import { TrackerService } from '../../features/seeker/services/trackerService';
import { ShortlistFeed } from '../../features/seeker/components/Shortlist/ShortlistFeed';
import { MarketTrends } from '../../features/seeker/components/Market/MarketTrends';
import { SkeletonDashboardCard, SkeletonJobCard } from '../../components/ui/Skeleton';
import type { ResumeAnalysisResult, SkillGap, SeekerProfile } from '../../features/seeker/types';
import type { Application } from '../../features/applications/types';
import { Edit3 } from 'lucide-react';
import * as Sentry from '@sentry/react';

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
            if (!user) {
                return;
            }
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
                Sentry.captureException(error);
                console.error("Dashboard data fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        void fetchDashboardData();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-sky-50 flex flex-col font-sans" data-testid="dashboard-skeleton">
                <Header />
                <main className="flex-grow p-6 md:p-12">
                    <div className="max-w-7xl mx-auto">
                        {/* Skeleton header */}
                        <div className="mb-12">
                            <div className="h-10 w-56 bg-slate-200 animate-pulse rounded-lg mb-3" />
                            <div className="h-4 w-40 bg-slate-100 animate-pulse rounded" />
                        </div>
                        {/* Skeleton two-column grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="space-y-4">
                                    {[0, 1, 2].map(i => <SkeletonJobCard key={i} />)}
                                </div>
                                <SkeletonDashboardCard />
                            </div>
                            <div className="space-y-8">
                                <SkeletonDashboardCard />
                                <div className="space-y-4">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const activeApplications = applications.filter(app => app.status !== 'rejected' && app.status !== 'withdrawn');

    // Priority: Profile Target Role ?? Skill Gap Role ?? Resume Role
    const targetRole = profile?.preferences.roles[0] ?? skillGap?.target_role ?? resume?.parsed_data.experience?.[0]?.role ?? "Your Target Role";

    return (
        <div className="min-h-screen bg-sky-50 flex flex-col font-sans">
            <Header />

            <main className="flex-grow p-6 md:p-12">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Header */}
                    <header className="mb-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2 block">Your Dashboard</span>
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                                    Welcome back, {user?.displayName?.split(' ')[0] ?? 'Seeker'}
                                </h1>
                                <p className="text-sm text-slate-500">Here's your career snapshot for today.</p>
                            </div>
                            <button
                                onClick={() => navigate('/seeker/tracker')}
                                className="bg-white rounded-2xl border border-sky-100 shadow-soft p-5 flex items-center gap-5 hover:shadow-soft-md hover:border-sky-200 transition-all group text-left"
                                aria-label={`View ${activeApplications.length} active applications in tracker`}
                            >
                                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center group-hover:bg-sky-600 transition-colors">
                                    <Briefcase className="w-6 h-6 text-sky-600 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <div className="text-3xl font-bold text-slate-900 leading-none">{activeApplications.length}</div>
                                        <div className="text-xs text-slate-400 font-medium">Active Apps</div>
                                    </div>
                                    <div className="flex gap-4 mt-1.5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-emerald-600">
                                                {activeApplications.filter(a => a.status === 'interview').length} Interviewing
                                            </span>
                                        </div>
                                        <div className="flex flex-col border-l border-slate-200 pl-4">
                                            <span className="text-xs font-semibold text-sky-600">
                                                {activeApplications.filter(a => a.status === 'applied').length} Applied
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* LEFT COLUMN: Core Insights */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* 1. Daily Shortlist */}
                            <section className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                                <ShortlistFeed userId={user?.uid ?? ''} />
                            </section>

                            {/* 2. Market Trends */}
                            <section>
                                <MarketTrends role={targetRole} />
                            </section>

                            {/* 3. Professional Identity Card */}
                            <section className="bg-white rounded-2xl border border-slate-200 shadow-soft p-8">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl font-bold text-slate-900">Professional Identity</h2>
                                            {profile?.verified_skills && profile.verified_skills.length > 0 && (
                                                <span className="bg-emerald-100 p-1 rounded-full" title="Verified Profile">
                                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <p className="text-xs font-medium text-slate-400">Target Role</p>
                                            <div className="inline-block bg-sky-50 border border-sky-200 text-sky-800 px-4 py-2 text-lg font-semibold rounded-xl">
                                                {targetRole}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto space-y-3">
                                        <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                                            <p className="text-xs font-medium text-slate-400 mb-2">Profile Health</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-sky-500 rounded-full transition-all duration-1000"
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
                                                <span className="font-bold text-sm text-slate-700 tabular-nums">
                                                    {((profile ? 20 : 0) +
                                                        (resume ? 20 : 0) +
                                                        (profile?.bio ? 20 : 0) +
                                                        ((profile?.skills.length ?? 0) > 0 ? 20 : 0) +
                                                        (profile?.preferences.roles.length ? 20 : 0))}%
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate('/seeker/profile')}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <Edit3 className="w-4 h-4" /> Edit Profile
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Bio / Headline */}
                                    <div className="space-y-3">
                                        <p className="text-xs font-medium text-slate-400">Professional Summary</p>
                                        <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-sky-200 pl-4 italic">
                                            {profile?.bio ?? "No professional summary added yet. Update your profile to stand out to employers."}
                                        </p>
                                    </div>

                                    {/* Top Skills section */}
                                    <div className="space-y-3">
                                        <p className="text-xs font-medium text-slate-400">Core Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(profile?.skills ?? resume?.keywords.found ?? []).slice(0, 8).map((skill, i) => (
                                                <span key={i} className="bg-sky-50 text-sky-700 border border-sky-100 px-3 py-1 text-xs font-medium rounded-full">
                                                    {skill}
                                                </span>
                                            ))}
                                            {(profile?.skills.length ?? 0) === 0 && (resume?.keywords.found.length ?? 0) === 0 && (
                                                <p className="text-sm text-slate-400 italic">No skills identified yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${resume ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
                                            <span className="text-xs text-slate-500">Resume Linked</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${profile?.skills.length ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
                                            <span className="text-xs text-slate-500">Skills Mapped</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate('/seeker/skills')}
                                        className="w-full md:w-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-2"
                                    >
                                        <TrendingUp className="w-4 h-4" />
                                        Open Gap Analysis
                                    </button>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN: Tools & Status */}
                        <div className="space-y-8">

                            {/* 4. Resume Score Card */}
                            <section className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                                <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-sky-600" />
                                    Resume Health
                                </h2>
                                {resume ? (
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xl font-bold text-sky-700 tabular-nums">{Math.round(resume.score)}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-400 mb-1.5">ATS Compatibility Score</p>
                                            <button
                                                onClick={() => navigate('/seeker/resume')}
                                                className="text-xs font-semibold text-sky-600 hover:text-sky-700 underline underline-offset-2"
                                            >
                                                Improve Resume
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-5 text-center">
                                        <p className="text-xs font-medium text-slate-400 mb-3">No Resume Analyzed</p>
                                        <button
                                            onClick={() => navigate('/seeker/resume')}
                                            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-xs font-semibold rounded-lg transition-colors"
                                        >
                                            Upload Now
                                        </button>
                                    </div>
                                )}
                            </section>

                            {/* 5. Tool Navigator */}
                            <section className="space-y-3">
                                <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Tools</h2>

                                <ToolLink
                                    icon={<Gift className="w-5 h-5" />}
                                    title="Referral Hub"
                                    description="Earn Brownie Points"
                                    onClick={() => navigate('/seeker/referral')}
                                />

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

                                <ToolLink
                                    icon={<Bookmark className="w-5 h-5" />}
                                    title="Saved Jobs"
                                    description="Bookmarked for later"
                                    onClick={() => navigate('/seeker/saved')}
                                />

                                <ToolLink
                                    icon={<Bell className="w-5 h-5" />}
                                    title="Job Alerts"
                                    description="Get notified for new matches"
                                    onClick={() => navigate('/seeker/alerts')}
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
        className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-sky-200 hover:shadow-soft transition-all group"
    >
        <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600 group-hover:bg-sky-100 transition-colors flex-shrink-0">
                {icon}
            </div>
            <div>
                <div className="text-sm font-semibold text-slate-900">{title}</div>
                <div className="text-xs text-slate-400">{description}</div>
            </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
    </button>
);
