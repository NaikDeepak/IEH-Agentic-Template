import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
    return (
        <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-50">
            {/* Background Gradients (Subtle & Premium) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[80%] bg-gradient-to-br from-blue-50/50 via-sky-50/30 to-indigo-50/20 blur-3xl opacity-80 pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6"
                >
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span className="text-sm font-medium text-slate-700">India's #1 Active AI Hiring Ecosystem</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 max-w-4xl mb-6 leading-[1.1]"
                >
                    The <span className="text-sky-600">Active</span> way to <br className="hidden md:block" /> Hire & Get Hired.
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed"
                >
                    Stop collecting resumes. Start making matches. Our AI ensures responsiveness with the 4-day Active Rule.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
                >
                    <button className="group relative w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-full font-semibold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                        Hire Talent
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-semibold text-lg hover:bg-slate-50 transition-all shadow-sm hover:shadow-md flex items-center justify-center">
                        Find Jobs
                    </button>
                </motion.div>
            </div>
        </section>
    );
};
