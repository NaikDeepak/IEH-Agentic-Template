import React from 'react';
import { Quote, ArrowLeft, ArrowRight, Star } from 'lucide-react';

export const Testimonials: React.FC = () => {
    return (
        <section className="py-24 px-4 md:px-8 bg-gray-50 border-b-2 border-black font-sans">
            <div className="container mx-auto max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-2 border-black bg-white">

                    {/* Left Header Panel */}
                    <div className="lg:col-span-4 p-12 border-b-2 lg:border-b-0 lg:border-r-2 border-black bg-[#003366] text-white flex flex-col justify-between min-h-[400px]">
                        <div>
                            <Quote className="w-12 h-12 mb-8 text-white/20" />
                            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-6">
                                Impact<br/>Stories
                            </h2>
                            <p className="font-mono text-sm opacity-70 max-w-xs leading-relaxed">
                                REAL FEEDBACK FROM ENTERPRISE PARTNERS AND SUCCESSFUL CANDIDATES.
                            </p>
                        </div>
                        <div className="flex gap-0 pt-12">
                            <button className="w-14 h-14 border-2 border-white hover:bg-white hover:text-[#003366] flex items-center justify-center transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <button className="w-14 h-14 border-2 border-l-0 border-white hover:bg-white hover:text-[#003366] flex items-center justify-center transition-colors">
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Right Content Panel */}
                    <div className="lg:col-span-8 p-12 lg:p-20 flex flex-col justify-center">
                        <div className="flex gap-1 mb-8">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-black text-black" />
                            ))}
                        </div>

                        <blockquote className="text-2xl md:text-4xl font-black uppercase leading-tight tracking-tight mb-12">
                            "We reduced our time-to-hire by 40% using the Active Candidate system. The semantic matching is incredibly precise."
                        </blockquote>

                        <div className="flex items-center gap-6 border-t-2 border-black pt-8 w-full">
                            <div className="w-16 h-16 bg-gray-200 border-2 border-black overflow-hidden">
                                <img
                                    src="/images/testimonial_ceo.png"
                                    alt="Thomas Karlow"
                                    className="w-full h-full object-cover filter grayscale"
                                />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg uppercase tracking-wide">Thomas Karlow</h4>
                                <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">CEO, CAKAR INT.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
