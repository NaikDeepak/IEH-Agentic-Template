import React, { useState } from 'react';
import { searchJobs } from '../lib/ai/search';
import { Search, ArrowRight, Star, DollarSign } from 'lucide-react';

export const HeroSection: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setIsLoading(true);
        try {
            // This triggers the /api/embedding call
            await searchJobs(searchTerm);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="relative w-full pt-2 md:pt-4 pb-12 md:pb-20 px-2 md:px-6 flex flex-col items-center overflow-hidden bg-slate-50 font-sans">

            {/* Main Rounded Container */}
            <div className="w-full max-w-[1400px] bg-[#dae3e5] rounded-[2rem] md:rounded-[3.5rem] relative overflow-hidden flex flex-col md:flex-row items-center font-outfit text-slate-800 shadow-2xl ring-1 ring-slate-900/5">



                {/* Big Text Background - Responsive sizes */}
                <div className="absolute top-[12%] md:top-16 left-0 right-0 z-0 pointer-events-none select-none flex flex-col items-start justify-center pl-6 md:pl-16 overflow-hidden" aria-hidden="true">
                    <span className="text-[13vw] md:text-[11vw] font-black text-white leading-[0.85] tracking-tighter text-left uppercase whitespace-nowrap mask-image-text translate-y-0 md:translate-y-2 mix-blend-overlay md:mix-blend-normal">
                        INDIA
                    </span>

                    {/* Desktop: Single Line for EMPLOYMENT HUB */}
                    <span className="hidden md:block md:text-[8vw] font-black text-white leading-[0.85] tracking-tighter text-left uppercase whitespace-nowrap mask-image-text md:translate-y-2 md:mix-blend-normal">
                        EMPLOYMENT HUB
                    </span>

                    {/* Mobile: Split Lines for EMPLOYMENT and HUB */}
                    <span className="md:hidden text-[11vw] font-black text-white leading-[0.85] tracking-tighter text-left uppercase whitespace-nowrap mask-image-text translate-y-0 mix-blend-overlay">
                        EMPLOYMENT
                    </span>
                    <span className="md:hidden text-[13vw] font-black text-white leading-[0.85] tracking-tighter text-left uppercase whitespace-nowrap mask-image-text translate-y-0 mix-blend-overlay">
                        HUB
                    </span>
                </div>

                {/* Content Container (Mobile: Column, Desktop: Row) */}
                <div className="relative z-20 w-full flex flex-col md:flex-row pt-32 md:pt-0 min-h-[600px] md:min-h-[800px]">

                    {/* Left Side: Content */}
                    <div className="w-full md:w-1/2 px-6 md:pl-20 md:pr-0 py-8 md:pt-88 md:pb-20 flex flex-col gap-6 md:gap-10 order-2 md:order-1 items-center md:items-start text-center md:text-left">
                        {/* Hidden SEO H1 */}
                        <h1 className="sr-only">India Employment Hub - AI Powered Recruitment Platform</h1>

                        {/* Social Proof / Stats */}
                        <div className="bg-white/60 backdrop-blur-xl p-4 md:p-5 rounded-3xl w-full max-w-xs shadow-lg border border-white/80 relative z-30 flex flex-col gap-3 hover:bg-white/80 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-slate-800">Trusted by Recruiters</span>
                                <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 3, 5, 8].map((i) => (
                                        <div key={i} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden text-transparent">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Candidate profile snippet" />
                                        </div >
                                    ))}
                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                                        +50k
                                    </div>
                                </div >
                                <div className="text-xs font-semibold text-slate-700 leading-tight">
                                    Active<br />Candidates
                                </div>
                            </div >
                        </div >

                        {/* Search Bar */}
                        <div className="bg-white p-2 md:p-2.5 rounded-full shadow-2xl flex items-center w-full max-w-sm md:max-w-md z-30 transition-transform hover:scale-[1.02]">
                            <Search className="w-5 h-5 md:w-6 md:h-6 text-slate-400 ml-3 md:ml-4 shrink-0" aria-hidden="true" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search 'Java Developer'..."
                                aria-label="Search jobs for 'Java Developer' or 'HR Manager'"
                                className="flex-1 bg-transparent border-none outline-none px-3 md:px-4 text-sm md:text-base placeholder:text-slate-400 text-slate-800 min-w-0 font-medium"
                            />
                            <button
                                onClick={handleSearch}
                                disabled={isLoading}
                                className={`w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-full flex items-center justify-center text-white hover:bg-indigo-600 transition-colors shrink-0 shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                aria-label="Submit job search"
                            >
                                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                            </button>
                        </div>

                        {/* Trending Pills */}
                        <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start relative z-30">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Trending:</span>
                            {['Java', 'Python', 'Sales', 'Accounting'].map((skill) => (
                                <button
                                    key={skill}
                                    className="px-3 py-1.5 bg-white/60 backdrop-blur-md border border-white/50 rounded-full text-[10px] md:text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div >

                    {/* Right Side: Image */}
                    <div className="w-full md:w-1/2 relative h-[400px] md:h-full flex items-end justify-end order-1 md:order-2 overflow-hidden md:overflow-visible pr-0" >


                        {/* Masked Image Container */}
                        <div className="relative w-full h-[90%] md:h-[95%] flex items-end justify-end bottom-0 md:bottom-[-2.5%]" >
                            <img
                                src="/images/hero.png"
                                alt="Indian Tech Professional"
                                className="h-full w-auto object-cover max-w-none md:max-w-full translate-x-[20%] md:translate-x-[15%]"
                                style={{ maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)' }}
                            />

                            {/* Floating Value Card (Desktop Only) */}
                            <div className="hidden md:flex absolute bottom-40 left-16 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 z-30 items-center gap-4 animate-bounce-slow">
                                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">12k+ Active Jobs</p>
                                    <p className="text-xs text-slate-500 font-medium">Hiring Now</p>
                                </div>
                            </div>
                        </div >
                    </div >

                </div >

            </div >
        </section >
    );
};
