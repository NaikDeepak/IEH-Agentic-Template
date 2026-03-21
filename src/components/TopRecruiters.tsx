import React from 'react';
import { Building2, ArrowUpRight } from 'lucide-react';

export const TopRecruiters: React.FC = () => (
    <section className="bg-slate-50 border-y border-slate-200 font-sans">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 py-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                    <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-3 block">Trusted By</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Hiring Partners</h2>
                    <p className="text-sm text-slate-500 max-w-sm">
                        Joining forces with industry leaders to unlock global potential.
                    </p>
                </div>
                <button className="inline-flex items-center gap-2 text-sky-700 hover:text-sky-800 font-semibold text-sm transition-colors cursor-pointer">
                    View All Partners <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {['TCS', 'Infosys', 'Wipro', 'Google', 'Amazon', 'Microsoft'].map((company) => (
                    <div
                        key={company}
                        className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center gap-3 hover:shadow-soft hover:border-sky-200 transition-all duration-200 cursor-pointer group"
                    >
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-sky-50 transition-colors">
                            <Building2 className="w-6 h-6 text-slate-500 group-hover:text-sky-700 transition-colors" strokeWidth={1.5} />
                        </div>
                        <span className="font-semibold text-xs text-slate-600 text-center tracking-wide">
                            {company}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
