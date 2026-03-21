import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Brain, Kanban, Send, Search, UserCheck, ArrowRight } from 'lucide-react';

interface StepProps {
    number: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}

const Step: React.FC<StepProps> = ({ number, icon, title, description }) => (
    <div className="flex gap-5">
        <div className="flex-shrink-0 w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-700 font-bold text-sm tabular-nums">
            {number}
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-sky-600">{icon}</span>
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
        </div>
    </div>
);

type Persona = 'seeker' | 'employer';

export const HowItWorks: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Persona>('seeker');

    const seekerSteps: StepProps[] = [
        {
            number: '01',
            icon: <FileText className="w-5 h-5" />,
            title: 'Create Profile',
            description: 'Upload your resume. Our AI parses your skills, experience, and aspirations automatically.',
        },
        {
            number: '02',
            icon: <Brain className="w-5 h-5" />,
            title: 'Get AI-Matched',
            description: 'Semantic AI matches you to verified jobs — not by keywords, but by real fit.',
        },
        {
            number: '03',
            icon: <Kanban className="w-5 h-5" />,
            title: 'Track & Land',
            description: 'Kanban board to manage applications. AI interview prep to close the deal.',
        },
    ];

    const employerSteps: StepProps[] = [
        {
            number: '01',
            icon: <Send className="w-5 h-5" />,
            title: 'Post a Job',
            description: 'Describe the role. AI generates optimized listings that attract the right talent.',
        },
        {
            number: '02',
            icon: <Search className="w-5 h-5" />,
            title: 'AI Talent Search',
            description: 'Semantic search across 50K+ profiles. Find candidates ranked by fit, not keywords.',
        },
        {
            number: '03',
            icon: <UserCheck className="w-5 h-5" />,
            title: 'Hire & Onboard',
            description: 'Review applicants, shortlist, and close — 14 days average time-to-hire.',
        },
    ];

    const steps = activeTab === 'seeker' ? seekerSteps : employerSteps;
    const ctaPath = activeTab === 'seeker' ? '/jobs' : '/post-job';
    const ctaLabel = activeTab === 'seeker' ? 'Browse Jobs' : 'Post a Job Free';

    return (
        <section className="py-20 px-4 md:px-8 bg-white font-sans">
            <div className="container mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-10 pb-8 border-b border-slate-200">
                    <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-3 block">How It Works</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Three steps to your goal</h2>
                    <p className="text-slate-500 max-w-md text-sm leading-relaxed">
                        Whether you're finding your next role or your next hire.
                    </p>
                </div>

                {/* Tab Toggle */}
                <div className="flex bg-slate-100 rounded-xl p-1 mb-10 w-fit">
                    <button
                        onClick={() => { setActiveTab('seeker'); }}
                        className={`px-6 py-2.5 font-semibold text-sm rounded-lg transition-all duration-200 cursor-pointer ${activeTab === 'seeker'
                                ? 'bg-white text-sky-700 shadow-soft'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        I'm a Job Seeker
                    </button>
                    <button
                        onClick={() => { setActiveTab('employer'); }}
                        className={`px-6 py-2.5 font-semibold text-sm rounded-lg transition-all duration-200 cursor-pointer ${activeTab === 'employer'
                                ? 'bg-white text-sky-700 shadow-soft'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        I'm Hiring
                    </button>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {steps.map((step) => (
                        <div key={`${activeTab}-${step.number}`} className="bg-slate-50 rounded-xl border border-slate-200 p-7 hover:border-sky-200 hover:shadow-soft transition-all duration-200">
                            <Step {...step} />
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-10 flex justify-center">
                    <Link
                        to={ctaPath}
                        className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors duration-200 text-sm"
                    >
                        {ctaLabel}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

            </div>
        </section>
    );
};
