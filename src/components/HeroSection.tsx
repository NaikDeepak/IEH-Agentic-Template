import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { searchJobs } from '../lib/ai/search';
import { ArrowRight, Globe, ArrowUpRight, Users, Zap, Target } from 'lucide-react';

export const HeroSection: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setIsLoading(true);
        try {
            await searchJobs(searchTerm);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="relative w-full bg-gradient-to-br from-sky-50 via-white to-slate-50 font-sans">
            <div className="container mx-auto max-w-7xl px-4 md:px-8 pt-10 md:pt-20 pb-16">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Left Content — Job Seekers (Option 3: Soft UI) */}
                    <div className="w-full lg:w-7/12 flex flex-col justify-between gap-10">

                        <div className="flex flex-col gap-7">
                            <div className="inline-flex items-center gap-2 bg-white border border-sky-200 rounded-full px-4 py-1.5 w-fit shadow-soft">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-semibold text-sky-700 tracking-wide">Live Platform</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-slate-900">
                                India's Smartest<br />
                                <span className="text-sky-700">Job Platform</span>
                            </h1>

                            <p className="text-lg md:text-xl text-slate-500 max-w-lg leading-relaxed">
                                AI-powered matching connects you to verified opportunities — zero friction, zero ghosting.
                            </p>

                            {/* Search Box */}
                            <div className="w-full max-w-lg">
                                <div className="flex bg-white rounded-xl border border-slate-200 shadow-soft-md overflow-hidden focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="Search roles, skills, companies..."
                                        aria-label="Search for job roles"
                                        className="flex-1 bg-transparent border-none outline-none px-5 py-3.5 text-slate-900 placeholder:text-slate-400 text-sm"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={isLoading}
                                        aria-label="Search"
                                        className="bg-sky-700 hover:bg-sky-800 text-white px-5 py-3.5 transition-colors flex items-center justify-center cursor-pointer"
                                    >
                                        <ArrowRight className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="pt-8 border-t border-slate-200 flex flex-wrap gap-8 md:gap-12">
                            {[
                                { stat: '50K+', label: 'Active Talent' },
                                { stat: '12K+', label: 'Open Roles' },
                                { stat: '98%', label: 'Match Rate' },
                            ].map(({ stat, label }) => (
                                <div key={label}>
                                    <p className="text-3xl font-bold text-slate-900 tabular-nums">{stat}</p>
                                    <p className="text-xs font-medium text-slate-400 mt-1 tracking-wide">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel — Employers (Option 1: Professional SaaS) */}
                    <div className="w-full lg:w-5/12 relative min-h-[460px] rounded-2xl overflow-hidden shadow-soft-md">
                        {/* Marquee Strip */}
                        <div className="bg-sky-700 text-white py-2 overflow-hidden">
                            <div className="flex animate-marquee whitespace-nowrap">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <span key={i} className="mx-4 text-xs font-semibold flex items-center gap-2 tracking-wide">
                                        <Globe className="w-3 h-3" /> Hiring Across India
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="relative overflow-hidden group h-full min-h-[420px]">
                            <picture>
                                <source srcSet="/images/hero.webp" type="image/webp" />
                                <img
                                    src="/images/hero.png"
                                    alt="Professional"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </picture>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/10"></div>

                            {/* Employer Value Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 pb-10 text-white">
                                <h2 className="text-3xl font-bold leading-tight mb-2 drop-shadow-lg">
                                    <span className="text-white">Right Job,</span><br /><span className="text-emerald-400">Right Candidate.</span>
                                </h2>
                                <p className="text-sm text-white/90 leading-relaxed max-w-sm mb-5 drop-shadow">
                                    AI-powered talent matching. Post jobs. Find candidates. Zero friction.
                                </p>

                                <div className="flex gap-5 mb-6 pt-4 border-t border-white/20">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-semibold text-white/90">40% Faster Hiring</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-semibold text-white/90">93% Placement Rate</span>
                                    </div>
                                </div>

                                <Link
                                    to="/post-job"
                                    className="inline-flex items-center gap-2 bg-white text-sky-700 hover:bg-sky-50 font-semibold px-6 py-3 rounded-lg transition-colors duration-200 text-sm"
                                >
                                    <Users className="w-4 h-4" />
                                    Post a Job Free
                                    <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
