import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, MapPin, Briefcase } from 'lucide-react';

export const HeroSection: React.FC = () => {
    return (
        <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-white selection:bg-indigo-100 selection:text-indigo-900">

            {/* Subtle Background Mesh - Lighter & Cleaner for Jobright vibe */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
                <div className="absolute -top-[30%] left-[20%] w-[60vw] h-[60vw] bg-indigo-100/60 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] bg-blue-100/60 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center max-w-4xl">

                {/* Trust Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide uppercase mb-8"
                >
                    <Sparkles className="w-3 h-3" />
                    <span>AI-Powered Job Search</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6"
                >
                    Find your dream job <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                        using AI insights.
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg text-slate-500 mb-10 max-w-2xl"
                >
                    Stop swiping. Start matching. Our AI analyzes 10,000+ active roles to find the perfect fit for your skills and culture.
                </motion.p>

                {/* AI Search Bar Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="w-full max-w-3xl relative group z-20"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full opacity-20 group-hover:opacity-30 blur transition duration-200" />
                    <div className="relative flex items-center bg-white rounded-full shadow-xl border border-slate-200 p-2 pl-6 transition-all focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-300">

                        <Search className="w-6 h-6 text-slate-400 mr-4 flex-shrink-0" />

                        <input
                            type="text"
                            placeholder="Ex: Product Designer in Bangalore with 4+ years exp..."
                            className="flex-grow bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 text-lg py-2"
                        />

                        <div className="hidden md:flex items-center border-l border-slate-200 pl-4 ml-4 gap-2 text-slate-500">
                            <MapPin className="w-4 h-4" />
                            <select className="bg-transparent border-none outline-none text-sm font-medium cursor-pointer">
                                <option>Remote</option>
                                <option>India</option>
                                <option>Bangalore</option>
                            </select>
                        </div>

                        <button className="ml-2 bg-indigo-600 text-white rounded-full px-8 py-3 font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg flex items-center gap-2">
                            Search
                        </button>
                    </div>
                </motion.div>

                {/* Popular Tags */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap justify-center gap-3 mt-8"
                >
                    <span className="text-sm text-slate-400 font-medium">Popular:</span>
                    {['Frontend Dev', 'Product Manager', 'Data Scientist', 'Remote', 'Startup'].map((tag, i) => (
                        <button key={i} className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                            {tag}
                        </button>
                    ))}
                </motion.div>

            </div>
        </section>
    );
};
