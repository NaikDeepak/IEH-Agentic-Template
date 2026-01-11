import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, PlayCircle } from 'lucide-react';

export const HeroSection: React.FC = () => {
    return (
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 selection:bg-sky-200 selection:text-sky-900">
            {/* Organic Animated Background (The "Living" Gradient) */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-200/40 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -60, 0],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] bg-sky-200/40 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.4, 1],
                        x: [0, 100, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] bg-indigo-200/40 rounded-full blur-[100px]"
                />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
                {/* Badge - Pill shaped, glass effect */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/50 shadow-sm mb-8 hover:shadow-md transition-shadow cursor-default"
                >
                    <Sparkles className="w-4 h-4 text-sky-600 animate-pulse" />
                    <span className="text-sm font-semibold text-slate-600 tracking-wide uppercase text-[11px]">The New Standard</span>
                </motion.div>

                {/* Headline - Humanist Sans, Focus on "Active" */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className="text-6xl md:text-8xl font-bold tracking-tight text-slate-900 max-w-5xl mb-8 leading-[1.05]"
                >
                    Hiring is broken. <br className="hidden md:block" /> Let's get <span className="relative inline-block text-sky-600">
                        Active
                        <svg className="absolute w-full h-3 -bottom-1 left-0 text-sky-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                        </svg>
                    </span>.
                </motion.h1>

                {/* Subheadline - Conversational Tone */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="text-xl md:text-2xl text-slate-500 max-w-2xl mb-12 leading-relaxed font-light"
                >
                    No more black holes. No more ghosting. Just a 4-day active pulse that keeps candidates and companies in sync.
                </motion.p>

                {/* CTAs - Tactile, inviting */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center"
                >
                    <button className="group relative w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3">
                        Start Hiring
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>

                    <button className="group w-full sm:w-auto px-10 py-5 bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:bg-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-3">
                        <PlayCircle className="w-5 h-5 text-sky-600 group-hover:scale-110 transition-transform" />
                        How it works
                    </button>
                </motion.div>
            </div>
        </section>
    );
};
