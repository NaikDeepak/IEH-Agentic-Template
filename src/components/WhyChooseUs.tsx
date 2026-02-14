import React from 'react';
import { ShieldCheck, Zap, Brain, Clock, Users, FileText, Target, Sparkles } from 'lucide-react';

interface BenefitProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const Benefit: React.FC<BenefitProps> = ({ icon, title, description }) => (
    <div className="group border border-white/20 p-6 hover:bg-white hover:text-black transition-colors duration-300">
        <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold uppercase tracking-tight">{title}</h3>
            {icon}
        </div>
        <p className="text-sm font-mono opacity-70 leading-relaxed uppercase">{description}</p>
    </div>
);

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
        <section className="py-24 px-4 md:px-8 bg-black text-white font-sans">
            <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col gap-16">

                    {/* Header */}
                    <div className="border-l-4 border-white pl-8">
                        <span className="text-sm font-mono font-bold text-gray-400 uppercase tracking-widest mb-2 block">Our Mission</span>
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
                            Built for <br /> Ambition.
                        </h2>
                        <p className="text-xl text-gray-400 font-light leading-relaxed max-w-lg">
                            We've dismantled the traditional hiring chaos. No ghosting. No black boxes. Just verified opportunities and direct connections.
                        </p>
                    </div>

                    {/* Dual-Column Benefits */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-2 border-white">

                        {/* Seekers Column */}
                        <div className="border-b-2 lg:border-b-0 lg:border-r-2 border-white">
                            <div className="p-6 border-b border-white/20 flex items-center gap-3">
                                <FileText className="w-5 h-5 text-emerald-400" />
                                <h3 className="font-bold uppercase tracking-widest text-sm">For Job Seekers</h3>
                            </div>
                            <div className="flex flex-col">
                                {seekerBenefits.map((benefit, i) => (
                                    <div key={benefit.title} className={i < seekerBenefits.length - 1 ? 'border-b border-white/10' : ''}>
                                        <Benefit {...benefit} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Employers Column */}
                        <div>
                            <div className="p-6 border-b border-white/20 flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-emerald-400" />
                                <h3 className="font-bold uppercase tracking-widest text-sm">For Employers</h3>
                            </div>
                            <div className="flex flex-col">
                                {employerBenefits.map((benefit, i) => (
                                    <div key={benefit.title} className={i < employerBenefits.length - 1 ? 'border-b border-white/10' : ''}>
                                        <Benefit {...benefit} />
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-2 border-white">
                        {[
                            { stat: '93%', label: 'Placement Rate' },
                            { stat: '14d', label: 'Avg. Time to Hire' },
                            { stat: '85%', label: 'Interview in 7 Days' },
                            { stat: '50K+', label: 'Active Professionals' },
                        ].map((item, i) => (
                            <div key={item.label} className={`p-8 text-center ${i < 3 ? 'border-b md:border-b-0 md:border-r border-white/20' : ''}`}>
                                <p className="text-4xl font-black tabular-nums tracking-tighter">{item.stat}</p>
                                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 mt-2">{item.label}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};
