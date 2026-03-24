import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const SEEKER_PLANS = [
    {
        name: 'Free',
        price: 0,
        description: 'Get started with the basics.',
        features: [
            'Browse all job listings',
            '3 AI interview prep sessions / month',
            'Basic resume upload',
            'Apply to 5 jobs / month',
        ],
        cta: 'Get Started',
        ctaPath: '/register',
        highlight: false,
    },
    {
        name: 'Pro',
        price: 499,
        description: 'For serious job seekers.',
        features: [
            'Everything in Free',
            'Unlimited AI interview prep',
            'AI resume analysis & feedback',
            'Skill gap analysis',
            'Unlimited job applications',
            'Application tracker board',
        ],
        cta: 'Start Pro',
        ctaPath: '/register',
        highlight: true,
    },
    {
        name: 'Premium',
        price: 999,
        description: 'Maximum edge in your search.',
        features: [
            'Everything in Pro',
            'Insider connections',
            'Priority application badge',
            'AI CV builder',
            'Dedicated career tips',
        ],
        cta: 'Go Premium',
        ctaPath: '/register',
        highlight: false,
    },
];

const EMPLOYER_PLANS = [
    {
        name: 'Starter',
        price: 2999,
        description: 'For small teams hiring occasionally.',
        features: [
            '5 active job posts',
            'Basic candidate search',
            'Applicant management board',
            'Email support',
        ],
        cta: 'Get Started',
        ctaPath: '/register',
        highlight: false,
    },
    {
        name: 'Growth',
        price: 7999,
        description: 'For growing companies hiring at scale.',
        features: [
            '20 active job posts',
            'AI candidate matching',
            'Advanced talent search filters',
            'Applicant management board',
            'Priority listing placement',
            'Priority support',
        ],
        cta: 'Start Growth',
        ctaPath: '/register',
        highlight: true,
    },
    {
        name: 'Enterprise',
        price: null,
        description: 'Custom solutions for large organisations.',
        features: [
            'Unlimited job posts',
            'Dedicated account manager',
            'Custom integrations',
            'SLA-backed support',
            'Bulk hiring workflows',
        ],
        cta: 'Contact Sales',
        ctaPath: 'mailto:sales@workmila.com',
        highlight: false,
    },
];

type Tab = 'seeker' | 'employer';

export const PricingPage: React.FC = () => {
    const [tab, setTab] = useState<Tab>('seeker');
    const plans = tab === 'seeker' ? SEEKER_PLANS : EMPLOYER_PLANS;

    return (
        <div className="min-h-screen bg-sky-50 font-sans">
            <div className="container mx-auto px-4 md:px-8 py-16 max-w-5xl">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-slate-500 text-base max-w-xl mx-auto">
                        Whether you are finding your next role or hiring top talent, WorkMila has a plan for you.
                    </p>
                </div>

                {/* Tab toggle */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 shadow-soft">
                        <button
                            onClick={() => { setTab('seeker'); }}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                                tab === 'seeker'
                                    ? 'bg-sky-700 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-sky-700'
                            }`}
                        >
                            For Job Seekers
                        </button>
                        <button
                            onClick={() => { setTab('employer'); }}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                                tab === 'employer'
                                    ? 'bg-sky-700 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-sky-700'
                            }`}
                        >
                            For Employers
                        </button>
                    </div>
                </div>

                {/* Plan cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-2xl border p-6 flex flex-col ${
                                plan.highlight
                                    ? 'bg-sky-700 border-sky-700 shadow-soft-md text-white'
                                    : 'bg-white border-slate-200 shadow-soft text-slate-900'
                            }`}
                        >
                            {plan.highlight && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-0.5 rounded-full shadow-sm">
                                    Most Popular
                                </span>
                            )}

                            <div className="mb-4">
                                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${plan.highlight ? 'text-sky-200' : 'text-sky-700'}`}>
                                    {plan.name}
                                </p>
                                <div className="flex items-end gap-1 mb-1">
                                    {plan.price !== null ? (
                                        <>
                                            <span className="text-3xl font-bold">
                                                &#8377;{plan.price.toLocaleString('en-IN')}
                                            </span>
                                            <span className={`text-sm mb-1 ${plan.highlight ? 'text-sky-200' : 'text-slate-400'}`}>
                                                / month
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-3xl font-bold">Custom</span>
                                    )}
                                </div>
                                <p className={`text-sm ${plan.highlight ? 'text-sky-100' : 'text-slate-500'}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <ul className="flex-grow space-y-2.5 mb-6">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-sm">
                                        <Check
                                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-sky-200' : 'text-sky-600'}`}
                                        />
                                        <span className={plan.highlight ? 'text-sky-50' : 'text-slate-600'}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {plan.ctaPath.startsWith('/') ? (
                                <Link
                                    to={plan.ctaPath}
                                    className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                                        plan.highlight
                                            ? 'bg-white text-sky-700 hover:bg-sky-50'
                                            : 'bg-sky-700 text-white hover:bg-sky-800'
                                    }`}
                                >
                                    {plan.cta}
                                </Link>
                            ) : (
                                <a
                                    href={plan.ctaPath}
                                    className="block text-center py-2.5 rounded-xl text-sm font-semibold bg-sky-700 text-white hover:bg-sky-800 transition-colors duration-150"
                                >
                                    {plan.cta}
                                </a>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer note */}
                <p className="text-center text-slate-400 text-xs mt-10">
                    All prices are in Indian Rupees and exclude GST. Cancel anytime.
                </p>
            </div>
        </div>
    );
};
