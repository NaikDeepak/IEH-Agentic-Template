import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, BadgeCheck } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
    return (
        <section className="py-24 px-4 md:px-6 bg-slate-50 font-sans">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row items-center gap-16">

                    {/* Image Side */}
                    <div className="w-full md:w-1/2 relative">
                        <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <img
                                src="/images/about_collaboration.png"
                                alt="Team collaboration"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        {/* Blob/Decorations */}
                        <div className="absolute -top-10 -left-10 w-full h-full bg-slate-200 rounded-[2.5rem] -z-10" />

                        {/* Floater */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute bottom-10 -right-5 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 z-20 max-w-xs"
                        >
                            <BadgeCheck className="w-10 h-10 text-indigo-600" />
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Verified Companies</p>
                                <p className="text-xs text-slate-500">Active Jobs</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Content Side */}
                    <div className="w-full md:w-1/2">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 block">For Job Seekers</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight leading-none">
                            Find Your Dream Career.
                        </h2>
                        <p className="text-slate-500 text-lg mb-10 leading-relaxed font-light">
                            We connect you with top employers who value your skills and experience. Find jobs that match your career goals with our intelligent matching system.
                        </p>

                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center shrink-0" aria-hidden="true">
                                    <Users className="w-5 h-5 text-slate-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 uppercase tracking-tight mb-1">Seamless Application Process</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">Our user-friendly platform ensures a smooth experience. Track your applications, schedule interviews, and communicate with recruiters effortlessly.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center shrink-0" aria-hidden="true">
                                    <ShieldCheck className="w-5 h-5 text-slate-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 uppercase tracking-tight mb-1">Verified & Secure</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">Your safety and privacy are our top priorities. We verify all employers and implement robust measures to protect your data and personal information.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
