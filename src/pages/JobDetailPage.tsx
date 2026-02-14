import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobService } from '../features/jobs/services/jobService';
import type { JobPosting } from '../features/jobs/types';
import { Header } from '../components/Header';
import { ApplyModal } from '../components/ApplyModal';
import { useAuth } from '../hooks/useAuth';
import { ApplicationService } from '../features/applications/services/applicationService';
import {
    Loader2,
    ArrowLeft,
    MapPin,
    Briefcase,
    DollarSign,
    Clock,
    Share2,
    Building2,
    Calendar,
    ChevronRight,
    Zap
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState<JobPosting | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [checkingApplication, setCheckingApplication] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await JobService.getJobById(id);
                if (data) {
                    setJob(data);
                } else {
                    setError("Job posting not found.");
                }
            } catch (err) {
                console.error("Error fetching job details:", err);
                setError("Failed to load job details.");
            } finally {
                setLoading(false);
            }
        };

        const checkApplicationStatus = async () => {
            if (!user || !id) return;
            try {
                setCheckingApplication(true);
                const applied = await ApplicationService.hasApplied(id, user.uid);
                setHasApplied(applied);
            } catch (err) {
                console.error("Error checking application status:", err);
            } finally {
                setCheckingApplication(false);
            }
        };

        void fetchJob();
        void checkApplicationStatus();
    }, [id, user]);

    const handleApply = () => {
        if (!user) {
            void navigate('/login', { state: { from: `/jobs/${id ?? ''}` } });
            return;
        }
        setIsApplyModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-12 h-12 animate-spin text-black mb-4" />
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Retrieving Listing Data...</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="container mx-auto px-4 py-24 text-center">
                    <h1 className="text-6xl font-black uppercase tracking-tighter mb-6">404_NOT_FOUND</h1>
                    <p className="font-mono text-gray-500 mb-12 uppercase tracking-widest">{error ?? "This opportunity has either expired or moved."}</p>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="bg-black text-white px-10 py-4 font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none translate-y-0 hover:translate-x-1 hover:translate-y-1"
                    >
                        Return to Listings
                    </button>
                </div>
            </div>
        );
    }

    const formatSalary = () => {
        if (!job.salary_range) return 'Competitive';
        const { min, max, currency } = job.salary_range;
        return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    };

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
            <Header />

            <main className="container mx-auto px-4 md:px-8 py-12 max-w-7xl">
                {/* Navigation Back */}
                <button
                    onClick={() => navigate('/jobs')}
                    className="group flex items-center gap-2 mb-10 font-mono text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to open roles
                </button>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column: Job Details */}
                    <div className="flex-grow lg:w-2/3 space-y-12">
                        {/* Hero Header */}
                        <div className="border-b-8 border-black pb-12">
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-black ${job.status === 'active' ? 'bg-black text-white' : 'bg-gray-100'}`}>
                                    {job.status}
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-black bg-yellow-400">
                                    <Clock className="w-3 h-3" /> Urgent Hiring
                                </span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-6">
                                {job.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 font-mono text-xs font-bold uppercase tracking-[0.15em] text-gray-500">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-black" /> {job.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-black" /> {job.type.replace('-', ' ')}
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-black" /> {formatSalary()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-black" /> {job.work_mode}
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-black uppercase tracking-tighter border-l-8 border-black pl-4">Job Specification</h2>
                            <div className="prose prose-lg max-w-none font-sans leading-relaxed text-gray-800 whitespace-pre-wrap">
                                {job.description}
                            </div>
                        </div>

                        {/* Skills Section */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-black uppercase tracking-tighter border-l-8 border-black pl-4">Required Expertise</h2>
                            <div className="flex flex-wrap gap-3">
                                {job.skills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-5 py-2 border-2 border-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all cursor-default"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Company Section */}
                        {job.company_bio && (
                            <div className="bg-gray-50 border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-black flex items-center justify-center text-white">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">About the Company</h2>
                                </div>
                                <p className="font-sans leading-relaxed text-gray-600">
                                    {job.company_bio}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sidebar Actions */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-8 space-y-6">
                            {/* Action Card */}
                            <div className="border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white">
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-mono text-xs font-black uppercase text-gray-400">Closing In</span>
                                        <span className="font-mono text-xs font-black uppercase bg-red-100 text-red-600 px-2 py-0.5">3 Days Left</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 border border-black overflow-hidden">
                                        <div className="h-full bg-black w-3/4"></div>
                                    </div>
                                </div>

                                {hasApplied ? (
                                    <button
                                        onClick={() => navigate('/seeker/tracker')}
                                        className="w-full bg-black text-white py-6 text-xl font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all flex items-center justify-center gap-3 active:translate-y-1 mb-4 border-b-8 border-r-8 border-blue-600 shadow-none"
                                    >
                                        Track Application <Zap className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleApply}
                                        disabled={checkingApplication}
                                        className="w-full bg-black text-white py-6 text-xl font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all flex items-center justify-center gap-3 active:translate-y-1 mb-4"
                                    >
                                        {checkingApplication ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <>Apply Now <ChevronRight className="w-6 h-6" /></>
                                        )}
                                    </button>
                                )}

                                <p className="text-center font-mono text-[10px] uppercase text-gray-400 font-bold tracking-[0.2em]">
                                    Processed by India Employment Hub
                                </p>
                            </div>

                            {/* Info Card */}
                            <div className="border-4 border-black p-8 space-y-6 bg-gray-50">
                                <div className="flex items-start gap-4">
                                    <Calendar className="w-5 h-5 mt-0.5" />
                                    <div>
                                        <p className="font-mono text-[10px] font-black uppercase text-gray-400">Posted Date</p>
                                        <p className="font-bold uppercase text-sm">Recently</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 pt-4 border-t-2 border-dashed border-gray-200">
                                    <Zap className="w-5 h-5 mt-0.5" />
                                    <div>
                                        <p className="font-mono text-[10px] font-black uppercase text-gray-400">Match Potential</p>
                                        <p className="font-bold uppercase text-sm">82% Intelligence Match</p>
                                    </div>
                                </div>
                                <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-black font-black uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-all">
                                    <Share2 className="w-4 h-4" /> Share Listing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <ApplyModal
                job={job}
                isOpen={isApplyModalOpen}
                onClose={() => { setIsApplyModalOpen(false); }}
            />
        </div>
    );
};
