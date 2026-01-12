import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { Twitter, Linkedin, Github } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => (
    <footer className="py-24 bg-white border-t border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute bottom-0 left-[10%] w-[30vw] h-[30vw] bg-indigo-50 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center text-slate-500">
                <div className="mb-8 md:mb-0 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-slate-900 tracking-tighter text-2xl leading-none">IEH</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">AI-powered recruitment platform for India</span>
                    </div>
                </div>

                <div className="flex flex-col md:items-end gap-6">
                    <div className="flex gap-8">
                        {[{ icon: <Twitter />, label: 'Twitter' }, { icon: <Linkedin />, label: 'LinkedIn' }, { icon: <Github />, label: 'GitHub' }].map((social, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ y: -4, color: '#4f46e5' }}
                                className="transition-colors text-slate-400"
                                aria-label={social.label}
                            >
                                {React.cloneElement(social.icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}
                            </motion.button>
                        ))}
                    </div>
                    <span className="text-xs font-medium tracking-wide text-slate-400">
                        © {new Date().getFullYear()} INDIA EMPLOYMENT HUB. ALL RIGHTS RESERVED.
                    </span>
                </div>
            </div>
        </div>
    </footer>
);

export const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-inter selection:bg-indigo-100 selection:text-indigo-900">
            <HeroSection />
            <FeaturesSection />
            <Footer />
        </div>
    );
};
