import React from 'react';
import { motion } from 'framer-motion';
import { Bot, FileText, Zap, Users, Trophy, Target, ArrowUpRight } from 'lucide-react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay: number;
    className?: string;
    variant?: 'light' | 'dark' | 'glass' | 'accent';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay, className = "", variant = 'light' }) => {
    const variants = {
        light: "bg-white border-slate-100 text-slate-900",
        dark: "bg-slate-900 border-slate-800 text-white",
        glass: "bg-white/40 backdrop-blur-md border-white/40 text-slate-900",
        accent: "bg-gradient-to-br from-indigo-600 to-blue-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay, type: "spring", bounce: 0.2 }}
            className={`bento-card p-10 flex flex-col justify-between group ${variants[variant]} ${className}`}
        >
            <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${variant === 'dark' ? 'bg-indigo-400' : 'bg-indigo-300'}`} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${variant === 'light' ? 'bg-slate-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-white/10 text-white group-hover:bg-white group-hover:text-indigo-600'}`}>
                        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                            className: "w-8 h-8 transition-colors"
                        }) : icon}
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        className={`p-2 rounded-full cursor-pointer transition-colors ${variant === 'light' ? 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50' : 'text-white/30 hover:text-white hover:bg-white/10'}`}
                    >
                        <ArrowUpRight className="w-6 h-6" />
                    </motion.div>
                </div>

                <h3 className={`text-2xl font-bold mb-4 tracking-tight ${variant === 'accent' ? 'text-white' : ''}`}>{title}</h3>
                <p className={`text-base leading-relaxed font-inter font-medium opacity-70 ${variant === 'accent' ? 'text-indigo-50' : ''}`}>{description}</p>
            </div>

            <div className="mt-8 pt-8 border-t border-current/5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <span>Learn More</span>
                <div className="w-8 h-px bg-current" />
            </div>
        </motion.div>
    );
};

export const FeaturesSection: React.FC = () => {
    return (
        <section className="py-40 px-4 md:px-6 bg-slate-50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 text-indigo-600 font-black tracking-[0.2em] uppercase text-[10px] mb-4 bg-indigo-50 px-3 py-1 rounded-full"
                        >
                            <Target className="w-3 h-3" />
                            <span>Engineered for Velocity</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter"
                        >
                            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Active?</span>
                        </motion.h2>
                    </div>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-500 max-w-md font-light leading-relaxed font-inter"
                    >
                        We've built a high-frequency hiring stack designed for candidates who value momentum over bureaucracy.
                    </motion.p>
                </div>

                {/* Refined Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[minmax(400px,auto)]">
                    {/* Hero Feature */}
                    <FeatureCard
                        icon={<Bot />}
                        title="AI Hiring Agent"
                        description="Your high-fidelity personal recruiter. Auto-generates precision JDs, filters 24/7, and eradicates ghost jobs so you focus on actual talent."
                        delay={0}
                        variant="accent"
                        className="md:col-span-8"
                    />

                    <FeatureCard
                        icon={<Zap />}
                        title="The 4-Day Pulse"
                        description="Jobs expire if inactive for 4 days. Stay relevant in a zero-stale-data ecosystem."
                        delay={0.1}
                        variant="dark"
                        className="md:col-span-4"
                    />

                    <FeatureCard
                        icon={<FileText />}
                        title="ATS Optimizer"
                        description="Real-time resume scoring and keyword injection to ensure you bypass the algorithmic gatekeepers."
                        delay={0.2}
                        variant="light"
                        className="md:col-span-4"
                    />

                    <FeatureCard
                        icon={<Target />}
                        title="Trajectory Matching"
                        description="We align you with companies based on growth velocity, cultural trajectory, and role impact."
                        delay={0.3}
                        variant="light"
                        className="md:col-span-5"
                    />

                    <FeatureCard
                        icon={<Users />}
                        title="Alumni Network"
                        description="Direct bridges to alumni at Fortune 500 and Top-Tier startups."
                        delay={0.4}
                        variant="light"
                        className="md:col-span-3"
                    />

                    <FeatureCard
                        icon={<Trophy />}
                        title="Verified Skill Challenges"
                        description="Proof is the new currency. Complete verified assessments and earn badges that top-tier companies actually trust."
                        delay={0.5}
                        variant="glass"
                        className="md:col-span-12 !min-h-[300px]"
                    />
                </div>
            </div>
        </section>
    );
};
