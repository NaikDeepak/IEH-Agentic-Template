import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CompanyService } from '../features/companies/services/companyService';
import { JobService } from '../features/jobs/services/jobService';
import { Company } from '../features/companies/types';
import { JobPosting } from '../features/jobs/types';
import { Header } from '../components/Header';
import { JobCard } from '../components/JobCard';
import { Loader2, ArrowLeft, Globe, MapPin, ExternalLink } from 'lucide-react';
import { Job } from '../types';

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
            return (match?.[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
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
            <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center py-24">
                    <Loader2 className="w-12 h-12 animate-spin text-black mb-6" />
                    <p className="font-mono text-sm font-bold uppercase tracking-widest text-gray-500">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                <Header />
                <div className="flex-grow container mx-auto px-4 py-24 text-center">
                    <h1 className="text-4xl font-black uppercase mb-4">404 // Profile Not Found</h1>
                    <p className="font-mono text-gray-500 mb-8">{error ?? "The company you're looking for doesn't exist."}</p>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest"
                    >
                        Return to Jobs
                    </button>
                </div>
            </div>
        );
    }

    const videoEmbedUrl = company.video_url ? getEmbedUrl(company.video_url) : null;

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-black">
            <Header />

            <main className="flex-grow container mx-auto px-4 md:px-8 py-12 max-w-6xl">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-2 mb-8 font-mono text-xs uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {/* Hero Section */}
                <div className="border-b-4 border-black pb-12 mb-16">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="flex-1">
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none mb-4">
                                {company.name}
                            </h1>
                            {company.tagline && (
                                <p className="text-2xl md:text-3xl font-light text-gray-500 tracking-tight mb-6">
                                    {company.tagline}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-6 font-mono text-xs font-bold uppercase tracking-widest">
                                {company.location && (
                                    <span className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> {company.location}
                                    </span>
                                )}
                                {company.website && (
                                    <a
                                        href={company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 hover:underline decoration-2"
                                    >
                                        <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                        {company.logo && (
                            <div className="w-32 h-32 md:w-48 md:h-48 border-4 border-black bg-white flex items-center justify-center p-4">
                                <img src={company.logo} alt={company.name} className="max-w-full max-h-full object-contain" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-16">
                        {/* Bio */}
                        <section>
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
                                <span className="w-8 h-[2px] bg-gray-200"></span> About {company.name}
                            </h2>
                            <div className="prose prose-xl font-light text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {company.bio}
                            </div>
                        </section>

                        {/* Video */}
                        {videoEmbedUrl && (
                            <section>
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
                                    <span className="w-8 h-[2px] bg-gray-200"></span> Culture & Mission
                                </h2>
                                <div className="aspect-video border-4 border-black bg-gray-100 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                                    <iframe
                                        src={videoEmbedUrl}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title="Company Introduction"
                                    ></iframe>
                                </div>
                            </section>
                        )}

                        {/* Job Library */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-4">
                                    <span className="w-8 h-[2px] bg-gray-200"></span> Open Positions
                                </h2>
                                <span className="font-mono text-xs font-bold uppercase tracking-widest bg-black text-white px-3 py-1">
                                    {jobs.length} Active
                                </span>
                            </div>

                            {jobs.length === 0 ? (
                                <div className="border-2 border-dashed border-gray-200 p-12 text-center">
                                    <p className="font-mono text-sm text-gray-400 uppercase tracking-widest">No open roles at the moment.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {jobs.map(job => (
                                        <JobCard key={job.id} job={mapJobPostingToJob(job)} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-12">
                        {company.tech_stack && company.tech_stack.length > 0 && (
                            <div className="border-2 border-black p-8 bg-gray-50">
                                <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b-2 border-black pb-2">Tech Stack</h3>
                                <div className="flex flex-wrap gap-2">
                                    {company.tech_stack.map(tech => (
                                        <span key={tech} className="bg-white border border-black px-3 py-1 font-mono text-xs font-bold">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-black text-white p-8">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-4">Want to work here?</h3>
                            <p className="font-mono text-xs text-gray-400 mb-6 leading-relaxed">
                                Join {company.name} and help build the future. All roles are evaluated via our semantic matching engine.
                            </p>
                            <div className="h-1 w-12 bg-white"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
