import React from 'react';
import { ShieldCheck, Zap, Brain, Clock, Users, FileText, Target, Sparkles } from 'lucide-react';

interface BenefitProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export const WhyChooseUs: React.FC = () => {

    const seekerBenefits: BenefitProps[] = [
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Direct Access',
            description: 'Skip the middleman. Connect directly with hiring managers who control the budget.',
        },
        {
            icon: <ShieldCheck className="w-6 h-6" />,
            title: 'Verified Jobs',
            description: 'Every employer is vetted. Every job is real. Zero tolerance for scams or stale listings.',
        },
        {
            icon: <Brain className="w-6 h-6" />,
            title: 'AI-Powered Tools',
            description: 'Resume AI, Interview Prep, Skill Gap Analysis — everything to accelerate your career.',
        },
    ];

    const employerBenefits: BenefitProps[] = [
        {
            icon: <Target className="w-6 h-6" />,
            title: 'AI Talent Search',
            description: 'Semantic matching finds candidates by real fit — not outdated keyword filters.',
        },
        {
            icon: <Clock className="w-6 h-6" />,
            title: '14-Day Avg. Hire',
            description: 'From posting to offer in two weeks. No more months-long hiring pipelines.',
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: 'Top 1% Talent Pool',
            description: '50K+ verified, active professionals across India. Quality over quantity.',
        },
    ];

    return (
        <section className="py-20 px-4 md:px-8 bg-slate-900 text-white font-sans">
            <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col gap-16">

                    {/* Header */}
                    <div className="max-w-2xl">
                        <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-3 block">Our Mission</span>
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">Built for Ambition.</h2>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            We've dismantled the traditional hiring chaos. No ghosting. No black boxes. Just verified opportunities and direct connections.
                        </p>
                    </div>

                    {/* Dual-Column Benefits */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-slate-800 rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                                <FileText className="w-5 h-5 text-sky-400" />
                                <h3 className="font-semibold text-slate-200 text-sm tracking-wide">For Job Seekers</h3>
                            </div>
                            <div className="flex flex-col gap-5">
                                {seekerBenefits.map((benefit) => (
                                    <div key={benefit.title} className="flex gap-4">
                                        <div className="w-9 h-9 bg-sky-700/30 rounded-lg flex items-center justify-center flex-shrink-0 text-sky-400">{benefit.icon}</div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">{benefit.title}</h4>
                                            <p className="text-sm text-slate-400 leading-relaxed">{benefit.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-800 rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                                <Sparkles className="w-5 h-5 text-sky-400" />
                                <h3 className="font-semibold text-slate-200 text-sm tracking-wide">For Employers</h3>
                            </div>
                            <div className="flex flex-col gap-5">
                                {employerBenefits.map((benefit) => (
                                    <div key={benefit.title} className="flex gap-4">
                                        <div className="w-9 h-9 bg-sky-700/30 rounded-lg flex items-center justify-center flex-shrink-0 text-sky-400">{benefit.icon}</div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">{benefit.title}</h4>
                                            <p className="text-sm text-slate-400 leading-relaxed">{benefit.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { stat: '93%', label: 'Placement Rate' },
                            { stat: '14d', label: 'Avg. Time to Hire' },
                            { stat: '85%', label: 'Interview in 7 Days' },
                            { stat: '50K+', label: 'Active Professionals' },
                        ].map((item) => (
                            <div key={item.label} className="bg-slate-800 rounded-xl p-6 text-center">
                                <p className="text-3xl font-bold tabular-nums text-white">{item.stat}</p>
                                <p className="text-xs font-medium text-slate-400 mt-2 tracking-wide">{item.label}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};
