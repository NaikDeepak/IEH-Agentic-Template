import React from 'react';
import { Quote, ArrowLeft, ArrowRight, Star } from 'lucide-react';

export const Testimonials: React.FC = () => {
    return (
        <section className="py-24 px-4 md:px-6 bg-[#dae3e5] font-sans rounded-t-[3rem] -mt-10 relative z-10">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row items-start justify-between gap-12">

                    {/* Left Side */}
                    <div className="w-full md:w-1/3">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight mb-8">
                            What Our <br /> Customers Say
                        </h2>
                        <div className="flex gap-4">
                            <button className="w-12 h-12 rounded-full border border-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button className="w-12 h-12 rounded-full border border-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors">
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Right Side (Card) */}
                    <div className="w-full md:w-2/3">
                        <div className="bg-[#eef4f5] p-10 rounded-[2.5rem] relative">
                            <Quote className="w-12 h-12 text-slate-300 absolute top-10 left-10" />
                            <div className="relative z-10 pl-8">
                                <p className="text-xl md:text-2xl font-medium text-slate-700 leading-relaxed mb-8">
                                    "We needed to fill a critical Senior Developer role quickly. India Employment Hub's Active Candidate system was a game-changer, helping us find and hire the perfect candidate in record time. Highly recommended for efficient recruitment."
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src="/images/testimonial_ceo.png"
                                            alt="Thomas Karlow"
                                            className="w-14 h-14 rounded-full object-cover"
                                        />
                                        <div>
                                            <h4 className="font-bold text-slate-900">Thomas Karlow</h4>
                                            <p className="text-sm text-slate-500">CEO at Cakar Int.</p>
                                        </div>
                                    </div>

                                    <div className="hidden md:flex flex-col items-end">
                                        <div className="flex gap-1 mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-slate-900 text-slate-900" />
                                            ))}
                                        </div>
                                        <span className="font-black text-slate-300 text-3xl tracking-widest">CAKAR</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
