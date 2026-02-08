import React from 'react';
import { ShieldCheck, Zap, Check } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
    return (
        <section className="py-24 px-4 md:px-8 bg-black text-white font-sans">
            <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Left Content */}
                    <div className="w-full lg:w-1/2">
                        <div className="mb-12 border-l-4 border-white pl-8">
                            <span className="text-sm font-mono font-bold text-gray-400 uppercase tracking-widest mb-2 block">Our Mission</span>
                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
                                Built for <br/> Ambition.
                            </h2>
                            <p className="text-xl text-gray-400 font-light leading-relaxed max-w-lg">
                                We've dismantled the traditional hiring chaos. No ghosting. No black boxes. Just verified opportunities and direct connections.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            <div className="group border border-white/20 p-6 hover:bg-white hover:text-black transition-colors duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-bold uppercase tracking-tight">Direct Access</h3>
                                    <Zap className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-mono opacity-70 leading-relaxed uppercase">
                                    Skip the middleman. Connect directly with hiring managers who control the budget.
                                </p>
                            </div>

                            <div className="group border border-white/20 p-6 hover:bg-white hover:text-black transition-colors duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-bold uppercase tracking-tight">Verified & Secure</h3>
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-mono opacity-70 leading-relaxed uppercase">
                                    Every employer is vetted. Every job is real. Zero tolerance for scams or stale listings.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Visual / Stats */}
                    <div className="w-full lg:w-1/2 relative">
                        <div className="relative z-10 border-2 border-white bg-gray-900 p-2">
                             <img
                                src="/images/about_collaboration.png"
                                alt="Collaboration"
                                className="w-full h-auto object-cover grayscale contrast-125 border border-white/20"
                            />
                        </div>

                        {/* Floating Stats Box */}
                        <div className="absolute -bottom-12 -left-4 md:-left-12 bg-white text-black p-8 border-2 border-black shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] max-w-sm z-20">
                            <h4 className="text-4xl font-black mb-2">93%</h4>
                            <p className="font-bold uppercase tracking-tight mb-4">Placement Rate</p>
                            <ul className="space-y-2">
                                {['Avg. 14 Days to Hire', 'Top 1% Talent Pool', 'Global Reach'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-gray-600">
                                        <Check className="w-3 h-3 text-black" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
