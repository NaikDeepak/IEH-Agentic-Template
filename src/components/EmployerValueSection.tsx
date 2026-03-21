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
    <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-soft hover:shadow-soft-md hover:border-sky-200 transition-all duration-200">
        <div className="flex items-start justify-between mb-5">
            <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center text-sky-700">
                {icon}
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold tabular-nums text-slate-900">{stat}</p>
                <p className="text-xs font-medium text-slate-400 mt-0.5 tracking-wide">{statLabel}</p>
            </div>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
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
        <section className="py-20 px-4 md:px-8 bg-white font-sans">
            <div className="container mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-full px-3 py-1 w-fit mb-4">
                            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                            <span className="text-xs font-semibold text-sky-700 tracking-wide">For Employers</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                            Why Employers Choose IEH
                        </h2>
                    </div>
                    <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
                        The tools, talent, and technology to build your dream team.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                    {cards.map((card) => (
                        <ValueCard key={card.title} {...card} />
                    ))}
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-between bg-sky-700 text-white p-8 md:p-10 rounded-2xl shadow-soft-md gap-6">
                    <div>
                        <h3 className="text-2xl font-bold mb-1">Start Hiring Today</h3>
                        <p className="text-sky-200 text-sm">Free to post. No credit card required.</p>
                    </div>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 bg-white text-sky-700 hover:bg-sky-50 font-semibold px-8 py-3.5 rounded-xl transition-colors duration-200 text-sm whitespace-nowrap"
                    >
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

            </div>
        </section>
    );
};
