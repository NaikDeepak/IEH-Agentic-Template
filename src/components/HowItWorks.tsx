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
    <div className="flex gap-6 group">
        <div className="flex-shrink-0 w-14 h-14 border-2 border-current flex items-center justify-center font-black text-xl tabular-nums group-hover:bg-black group-hover:text-white transition-colors">
            {number}
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
                {icon}
                <h3 className="text-lg font-bold uppercase tracking-tight">{title}</h3>
            </div>
            <p className="text-sm font-mono opacity-70 leading-relaxed uppercase">{description}</p>
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
        <section className="py-24 px-4 md:px-8 bg-white font-sans text-black border-b-2 border-black">
            <div className="container mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-16 border-b-2 border-black pb-8">
                    <h2 className="text-5xl md:text-7xl font-black text-black uppercase tracking-tighter mb-4 leading-[0.85]">
                        How It<br />Works
                    </h2>
                    <p className="text-gray-600 max-w-md text-sm font-mono uppercase tracking-wide">
                        Three steps. Whether you're finding your next role or your next hire.
                    </p>
                </div>

                {/* Tab Toggle */}
                <div className="flex border-2 border-black mb-16 w-fit">
                    <button
                        onClick={() => { setActiveTab('seeker'); }}
                        className={`px-8 py-4 font-bold uppercase tracking-widest text-sm transition-colors ${activeTab === 'seeker'
                                ? 'bg-black text-white'
                                : 'bg-white text-black hover:bg-gray-100'
                            }`}
                    >
                        I'm a Job Seeker
                    </button>
                    <button
                        onClick={() => { setActiveTab('employer'); }}
                        className={`px-8 py-4 font-bold uppercase tracking-widest text-sm border-l-2 border-black transition-colors ${activeTab === 'employer'
                                ? 'bg-black text-white'
                                : 'bg-white text-black hover:bg-gray-100'
                            }`}
                    >
                        I'm Hiring
                    </button>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-black">
                    {steps.map((step, i) => (
                        <div
                            key={`${activeTab}-${step.number}`}
                            className={`p-8 md:p-12 ${i < steps.length - 1 ? 'border-b-2 md:border-b-0 md:border-r-2 border-black' : ''}`}
                        >
                            <Step {...step} />
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-12 flex justify-center">
                    <Link
                        to={ctaPath}
                        className="inline-flex items-center gap-3 bg-black text-white px-10 py-5 font-bold uppercase tracking-widest text-sm hover:bg-[#003366] transition-colors border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all"
                    >
                        {ctaLabel}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

            </div>
        </section>
    );
};
