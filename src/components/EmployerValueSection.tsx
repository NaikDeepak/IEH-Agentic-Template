import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Kanban, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface ValueCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    stat: string;
    statLabel: string;
}

const ValueCard: React.FC<ValueCardProps> = ({ icon, title, description, stat, statLabel }) => (
    <div className="p-8 md:p-12 border-2 border-black bg-white group hover:bg-black hover:text-white transition-colors duration-300">
        <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 border-2 border-current flex items-center justify-center group-hover:border-white transition-colors">
                {icon}
            </div>
            <div className="text-right">
                <p className="text-3xl font-black tabular-nums tracking-tighter">{stat}</p>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 mt-1">{statLabel}</p>
            </div>
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tight mb-3">{title}</h3>
        <p className="text-sm font-mono opacity-70 leading-relaxed uppercase">{description}</p>
    </div>
);

export const EmployerValueSection: React.FC = () => {
    const cards: ValueCardProps[] = [
        {
            icon: <Brain className="w-7 h-7" />,
            title: 'AI Talent Matching',
            description: 'Our semantic AI ranks candidates by fit, not keywords. Find the perfect hire in minutes, not months.',
            stat: '98%',
            statLabel: 'Match Accuracy',
        },
        {
            icon: <Kanban className="w-7 h-7" />,
            title: 'Complete ATS',
            description: 'Post jobs, review applicants, shortlist candidates — all in one place. No spreadsheets.',
            stat: '14d',
            statLabel: 'Avg. Time to Hire',
        },
        {
            icon: <ShieldCheck className="w-7 h-7" />,
            title: 'Verified Talent Pool',
            description: 'Every candidate is real. Every profile is verified. 50K+ active, job-ready professionals.',
            stat: '50K+',
            statLabel: 'Active Candidates',
        },
    ];

    return (
        <section className="py-24 px-4 md:px-8 bg-gray-50 font-sans text-black border-b-2 border-black">
            <div className="container mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black pb-8 gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 border border-black px-3 py-1 w-fit bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-6">
                            <Sparkles className="w-3 h-3" />
                            <span className="text-xs font-mono font-bold uppercase tracking-widest">For Employers</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-black uppercase tracking-tighter mb-4 leading-[0.85]">
                            Why Employers<br />Choose IEH
                        </h2>
                    </div>
                    <p className="text-gray-600 max-w-sm text-sm font-mono uppercase tracking-wide text-right">
                        The tools, talent, and technology to build your dream team.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {cards.map((card) => (
                        <ValueCard key={card.title} {...card} />
                    ))}
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-between bg-black text-white p-8 md:p-12 border-2 border-black">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">Start Hiring Today</h3>
                        <p className="text-sm font-mono opacity-70 uppercase tracking-wide">Free to post. No credit card required.</p>
                    </div>
                    <Link
                        to="/register"
                        className="mt-6 sm:mt-0 inline-flex items-center gap-3 bg-white text-black px-10 py-5 font-bold uppercase tracking-widest text-sm hover:bg-emerald-400 transition-colors border-2 border-white hover:border-emerald-400 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

            </div>
        </section>
    );
};
