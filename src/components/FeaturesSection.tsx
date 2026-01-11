import React from 'react';
import { motion } from 'framer-motion';
import { Bot, FileText, Zap, Users, Trophy, Target, ArrowUpRight } from 'lucide-react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay: number;
    className?: string; // Allow custom classes for Bento sizing
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay, className = "" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay, type: "spring" }}
            className={`relative p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden ${className}`}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-sky-500 group-hover:rotate-12 transition-all duration-300">
                        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                            className: "w-7 h-7 text-slate-900 group-hover:text-white transition-colors"
                        }) : icon}
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-sky-500 transition-colors opacity-0 group-hover:opacity-100" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{description}</p>
            </div>
        </motion.div>
    );
};

export const FeaturesSection: React.FC = () => {
    return (
        <section className="py-32 px-4 md:px-6 bg-slate-50">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="inline-block text-sky-600 font-bold tracking-wider uppercase text-xs mb-4"
                    >
                        Capabilities
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
                    >
                        Why Choose <span className="text-sky-600 underline decoration-4 decoration-sky-200 underline-offset-4">Active</span>?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-500 max-w-2xl mx-auto font-light"
                    >
                        We've redesigned the hiring stack from the bottom up to prioritize speed and responsiveness.
                    </motion.p>
                </div>

                {/* Bento Grid Layout - Organic & Asymmetrical */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
                    {/* Hero Feature - Spans 2 cols */}
                    <FeatureCard
                        icon={<Bot />}
                        title="AI Hiring Assistant"
                        description="Your personal recruiter. Auto-generates JDs, screens candidates 24/7, and filters out ghost jobs instantly so you focus on people."
                        delay={0}
                        className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-white to-blue-50/50"
                    />

                    <FeatureCard
                        icon={<Zap />}
                        title="Active Ecosystem"
                        description="The 4-day rule: Jobs and profiles expire if inactive. No stale data."
                        delay={0.1}
                        className="bg-slate-900 !text-white !border-slate-800"
                    />

                    <FeatureCard
                        icon={<FileText />}
                        title="Resume Analyzer"
                        description="Instant ATS scoring. Beat the bots with real-time keyword optimization."
                        delay={0.2}
                    />

                    <FeatureCard
                        icon={<Users />}
                        title="Insider Connections"
                        description="Find alumni at Google, Microsoft, and more who actually want to help."
                        delay={0.3}
                    />

                    {/* Tall Feature - Spans 1 col but 2 rows visually conceptually (here just regular but distinctive) */}
                    <FeatureCard
                        icon={<Target />}
                        title="Smart Matching"
                        description="Forget keywords. Our AI matches on culture, velocity, and trajectory."
                        delay={0.4}
                        className="md:col-span-1 bg-sky-50 border-sky-100"
                    />

                    <FeatureCard
                        icon={<Trophy />}
                        title="Skill Challenges"
                        description="Don't just say you can code. Prove it and earn verified badges."
                        delay={0.5}
                        className="md:col-span-3"
                    />
                </div>
            </div>
        </section>
    );
};
