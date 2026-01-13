import React from 'react';
import { Building2, ArrowRight } from 'lucide-react';

export const TopRecruiters: React.FC = () => (
    <section className="bg-[#dae3e5] py-20 px-4 md:px-6 font-sans">
        <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                {/* Decorative Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

                <div className="max-w-xl relative z-10">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2 block">Top Employers</span>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">Hiring Now</h2>
                    <p className="text-slate-500 mb-8 text-lg">Join thousands of companies using IEH to find their next superstar. From tech giants to fast-growing startups.</p>
                    <button type="button" className="px-8 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group">
                        Explore Companies
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-6 relative z-10 opacity-80">
                    {['TCS', 'Infosys', 'Wipro', 'Google', 'Amazon', 'Microsoft'].map((company) => (
                        <div key={company} className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-white hover:shadow-md transition-all cursor-pointer">
                            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-slate-600">{company}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
);
