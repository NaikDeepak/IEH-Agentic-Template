import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CompanyService } from '../features/companies/services/companyService';
import { JobService } from '../features/jobs/services/jobService';
import type { Company } from '../features/companies/types';
import type { JobPosting } from '../features/jobs/types';
import { Header } from '../components/Header';
import { JobCard } from '../components/JobCard';
import { ArrowLeft, Globe, MapPin, ExternalLink } from 'lucide-react';
import type { Job } from '../types';

export const CompanyProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [company, setCompany] = useState<Company | null>(null);
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const [companyData, companyJobs] = await Promise.all([
                    CompanyService.getCompanyById(id),
                    JobService.getJobsByCompanyId(id)
                ]);

                if (!companyData) {
                    setError("Company not found.");
                } else {
                    setCompany(companyData);
                    setJobs(companyJobs);
                }
            } catch (err) {
                console.error("Error loading company profile:", err);
                setError("Failed to load company profile.");
            } finally {
                setLoading(false);
            }
        };

        void loadData();
    }, [id]);

    const getEmbedUrl = (url: string) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = regExp.exec(url);
            return (match?.[2]?.length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
        }
        if (url.includes('vimeo.com')) {
            const regExp = /vimeo\.com\/(\d+)/;
            const match = regExp.exec(url);
            return match ? `https://player.vimeo.com/video/${match[1]}` : null;
        }
        return null;
    };

    // Helper to map backend JobPosting to frontend Job type for JobCard
    const mapJobPostingToJob = (posting: JobPosting): Job => {
        let jobType: Job['type'] = undefined;
        const typeStr = posting.type.toLowerCase().replace('_', '-');
        if (['full-time', 'part-time', 'contract', 'freelance', 'internship'].includes(typeStr)) {
            jobType = typeStr as Job['type'];
        }

        return {
            id: posting.id ?? '',
            employerId: posting.employer_id,
            title: posting.title,
            description: posting.description,
            status: posting.status === 'active' ? 'active' :
                posting.status === 'passive' ? 'passive' : 'closed',
            lastActiveAt: posting.lastActiveAt ?? posting.created_at,
            expiresAt: posting.expiresAt ?? posting.created_at,
            createdAt: posting.created_at,
            updatedAt: posting.updated_at,
            location: posting.location,
            type: jobType,
            salaryRange: posting.salary_range
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-sky-50 flex flex-col font-sans">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-sky-700 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">Loading company profile...</p>
                </div>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="min-h-screen bg-sky-50 flex flex-col font-sans">
                <Header />
                <div className="flex-grow container mx-auto px-4 py-24 text-center max-w-lg">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Company Not Found</h1>
                    <p className="text-sm text-slate-500 mb-8">{error ?? "The company you're looking for doesn't exist."}</p>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        Browse Jobs
                    </button>
                </div>
            </div>
        );
    }

    const videoEmbedUrl = company.video_url ? getEmbedUrl(company.video_url) : null;

    return (
        <div className="min-h-screen bg-sky-50 flex flex-col font-sans">
            <Header />

            <main className="flex-grow container mx-auto px-4 md:px-8 py-10 max-w-6xl">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {/* Hero Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-2">
                                {company.name}
                            </h1>
                            {company.tagline && (
                                <p className="text-base text-slate-500 mb-4">{company.tagline}</p>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                {company.location && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" /> {company.location}
                                    </span>
                                )}
                                {company.website && (
                                    <a
                                        href={company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-sky-600 hover:text-sky-800 transition-colors"
                                    >
                                        <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                        {company.logo && (
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl border border-slate-200 bg-white flex items-center justify-center p-3 shrink-0">
                                <img src={company.logo} alt={company.name} loading="lazy" className="max-w-full max-h-full object-contain" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">About {company.name}</h2>
                            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {company.bio}
                            </div>
                        </div>

                        {/* Video */}
                        {videoEmbedUrl && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Culture & Mission</h2>
                                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                                    <iframe
                                        src={videoEmbedUrl}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title="Company Introduction"
                                    ></iframe>
                                </div>
                            </div>
                        )}

                        {/* Job Library */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Open Positions</h2>
                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                    {jobs.length} active
                                </span>
                            </div>

                            {jobs.length === 0 ? (
                                <div className="border-2 border-dashed border-slate-100 rounded-xl p-10 text-center">
                                    <p className="text-sm text-slate-400">No open roles at the moment.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {jobs.map(job => (
                                        <JobCard key={job.id} job={mapJobPostingToJob(job)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        {company.tech_stack && company.tech_stack.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Tech Stack</h3>
                                <div className="flex flex-wrap gap-2">
                                    {company.tech_stack.map(tech => (
                                        <span key={tech} className="px-3 py-1 bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-full">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-sky-700 text-white rounded-2xl p-5">
                            <h3 className="text-sm font-semibold mb-2">Want to work here?</h3>
                            <p className="text-xs text-sky-200 leading-relaxed">
                                Join {company.name} and help build the future. All roles are evaluated via our semantic matching engine.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
