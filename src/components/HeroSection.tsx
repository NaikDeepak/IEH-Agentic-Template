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
        <section className="relative w-full border-b-2 border-black bg-white font-sans text-black">
            <div className="container mx-auto max-w-7xl px-4 md:px-8 pt-12 md:pt-24 pb-12">
                <div className="flex flex-col lg:flex-row gap-0 border-2 border-black">

                    {/* Left Content — Job Seekers */}
                    <div className="w-full lg:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-between border-b-2 lg:border-b-0 lg:border-r-2 border-black relative overflow-hidden">

                        {/* Decorative Grid Background */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 -z-10"></div>

                        <div className="flex flex-col gap-8">
                            <div className="inline-flex items-center gap-2 border border-black px-3 py-1 w-fit bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-mono font-bold uppercase tracking-widest">Live Platform</span>
                            </div>

                            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-black">
                                India<br />
                                Employment<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-gray-500 to-black animate-gradient-x">Hub</span>
                            </h1>

                            <p className="text-lg md:text-xl font-medium text-gray-600 max-w-lg leading-relaxed border-l-4 border-black pl-6">
                                Find your next career move. AI-powered matching connects you to verified opportunities — zero friction, zero ghosting.
                            </p>

                            {/* Search Box */}
                            <div className="w-full max-w-md mt-4">
                                <div className="flex border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform focus-within:-translate-y-1 focus-within:translate-x-1 focus-within:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="SEARCH ROLES..."
                                        aria-label="Search for job roles"
                                        className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-black placeholder:text-gray-500 font-mono text-sm uppercase tracking-wider"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={isLoading}
                                        aria-label="Search"
                                        className="bg-black text-white px-6 py-4 hover:bg-[#003366] transition-colors flex items-center justify-center border-l-2 border-black"
                                    >
                                        <ArrowRight className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="mt-16 pt-8 border-t-2 border-black flex flex-wrap gap-8 md:gap-16">
                            <div>
                                <p className="text-4xl font-black tabular-nums tracking-tighter">50K+</p>
                                <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mt-1">Active Talent</p>
                            </div>
                            <div>
                                <p className="text-4xl font-black tabular-nums tracking-tighter">12K+</p>
                                <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mt-1">Open Roles</p>
                            </div>
                            <div>
                                <p className="text-4xl font-black tabular-nums tracking-tighter">98%</p>
                                <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mt-1">Match Rate</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel — Employers */}
                    <div className="w-full lg:w-5/12 bg-gray-100 relative min-h-[500px] lg:min-h-auto flex flex-col">
                        {/* Top Marquee Strip */}
                        <div className="bg-[#003366] text-white py-2 overflow-hidden border-b-2 border-black">
                            <div className="flex animate-marquee whitespace-nowrap">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <span key={i} className="mx-4 text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-2">
                                        <Globe className="w-3 h-3" /> Hiring Globally
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 relative overflow-hidden group">
                            <picture>
                                <source srcSet="/images/hero.webp" type="image/webp" />
                                <img
                                    src="/images/hero.png"
                                    alt="Professional"
                                    className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125 transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                                />
                            </picture>

                            {/* Dark Overlay for Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

                            {/* Employer Value Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                <div className="mb-6">
                                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none mb-3">
                                        Hire Smarter.<br />Hire Faster.
                                    </h2>
                                    <p className="text-sm font-mono opacity-80 leading-relaxed max-w-sm">
                                        AI-POWERED TALENT MATCHING. POST JOBS. FIND CANDIDATES. ZERO FRICTION.
                                    </p>
                                </div>

                                {/* Employer Stats */}
                                <div className="flex gap-6 mb-6 border-t border-white/30 pt-4">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-mono font-bold uppercase tracking-wider">40% Faster Hiring</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-mono font-bold uppercase tracking-wider">93% Placement</span>
                                    </div>
                                </div>

                                {/* Employer CTA */}
                                <Link
                                    to="/post-job"
                                    className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-emerald-400 hover:text-black transition-colors border-2 border-white hover:border-emerald-400 group/cta shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
                                >
                                    <Users className="w-5 h-5" />
                                    Post a Job Free
                                    <ArrowUpRight className="w-4 h-4 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
