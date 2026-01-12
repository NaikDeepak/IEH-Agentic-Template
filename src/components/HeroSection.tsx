import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { JobSearchBar } from './JobSearchBar';
import { PopularTags } from './PopularTags';

export const HeroSection: React.FC = () => {
    return (
        <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-white selection:bg-indigo-100 selection:text-indigo-900 pt-16">

            {/* Premium Background Mesh */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none opacity-60">
                <div className="absolute -top-[20%] left-[10%] w-[70vw] h-[70vw] bg-indigo-50/50 rounded-full blur-[140px] animate-pulse duration-[8000ms]" />
                <div className="absolute bottom-0 -right-[10%] w-[50vw] h-[50vw] bg-sky-50/50 rounded-full blur-[140px] animate-pulse duration-[6000ms]" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center max-w-5xl">

                {/* Trust Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-bold tracking-[0.1em] uppercase mb-10 shadow-xl shadow-indigo-500/10"
                >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>AI-powered recruitment platform for India</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, type: "spring" }}
                    className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[1.05]"
                >
                    Build your career with <br />
                    <span className="relative inline-block">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500">
                            Absolute Confidence.
                        </span>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="absolute -bottom-2 left-0 h-1.5 bg-indigo-100/50 rounded-full -z-10"
                        />
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl md:text-2xl text-slate-500 mb-12 max-w-3xl font-light leading-relaxed font-inter"
                >
                    <span className="text-slate-900 font-semibold block mb-2">Connecting Talent with Opportunity, Intelligently.</span>
                    IEH is the only AI-native hiring ecosystem that prioritizes responsiveness and cultural velocity for India's tech landscape.
                </motion.p>

                {/* Integrated Search Bar */}
                <JobSearchBar />

                {/* Integrated Tags */}
                <PopularTags />

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="mt-20 flex flex-col items-center gap-2"
                >
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explore Capabilities</span>
                    <div className="w-px h-12 bg-gradient-to-b from-indigo-500 to-transparent opacity-30" />
                </motion.div>

            </div>
        </section>
    );
};
