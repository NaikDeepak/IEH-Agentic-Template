import React from 'react';
import { Building2, ArrowUpRight } from 'lucide-react';

export const TopRecruiters: React.FC = () => (
    <section className="bg-white border-b-2 border-black font-sans">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 py-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-4">
                        Hiring<br/>Partners
                    </h2>
                    <p className="text-sm font-mono uppercase font-bold text-gray-500 max-w-sm">
                        Joining forces with industry leaders to unlock global potential.
                    </p>
                </div>
                <button className="px-8 py-4 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-[#003366] transition-colors flex items-center gap-2 group w-fit">
                    View All Partners <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-2 border-black bg-black gap-px">
                {['TCS', 'Infosys', 'Wipro', 'Google', 'Amazon', 'Microsoft'].map((company, _i) => (
                    <div
                        key={company}
                        className="bg-white p-8 md:p-12 flex flex-col items-center justify-center gap-6 hover:bg-gray-50 transition-colors group cursor-pointer aspect-square"
                    >
                        <div className="w-16 h-16 border-2 border-black flex items-center justify-center bg-gray-100 group-hover:bg-black group-hover:text-white transition-colors">
                            <Building2 className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                        <span className="font-mono font-bold uppercase tracking-widest text-sm text-center">
                            {company}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
