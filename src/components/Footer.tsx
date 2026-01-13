import React from 'react';
import { Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';

export const Footer: React.FC = () => (
    <footer className="py-20 bg-black text-white font-sans relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">

                {/* Brand Column */}
                <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1">
                            <img src="/images/logo.png" alt="IEH Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">India Employment Hub</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed max-w-sm mb-8">
                        The AI-powered job portal connecting India's top talent with active employers. Smart matching, no ghosting.
                    </p>
                    <div className="flex gap-4">
                        {[
                            { Icon: Twitter, label: "Twitter" },
                            { Icon: Facebook, label: "Facebook" },
                            { Icon: Instagram, label: "Instagram" },
                            { Icon: Linkedin, label: "LinkedIn" }
                        ].map(({ Icon, label }, i) => (
                            <a
                                key={i}
                                href="#"
                                aria-label={label}
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer text-white focus:ring-2 focus:ring-white outline-none"
                            >
                                <Icon className="w-5 h-5" aria-hidden="true" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Account */}
                <div>
                    <h4 className="font-bold text-sm tracking-widest uppercase mb-6 text-slate-500">For Candidates</h4>
                    <ul className="space-y-4 text-slate-300">
                        <li><a href="#" className="hover:text-white transition-colors">Browse Jobs</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Career Advice</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Resume Builder</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">AI Interview Prep</a></li>
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h4 className="font-bold text-sm tracking-widest uppercase mb-6 text-slate-500">For Employers</h4>
                    <ul className="space-y-4 text-slate-300">
                        <li><a href="#" className="hover:text-white transition-colors">Post a Job</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Talent Search</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Hiring Solutions</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h4 className="font-bold text-sm tracking-widest uppercase mb-6 text-slate-500">Company</h4>
                    <ul className="space-y-4 text-slate-300">
                        <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Trust & Safety</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                    </ul>
                </div>

            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                <span>© {new Date().getFullYear()} India Employment Hub. All rights reserved.</span>
                <div className="flex gap-8">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>
);
