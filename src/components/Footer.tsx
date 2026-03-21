import React from 'react';
import { Twitter, Linkedin, Facebook, Instagram, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => (
    <footer className="bg-slate-900 text-slate-300 font-sans">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

                {/* Brand Column */}
                <div className="md:col-span-4 flex flex-col gap-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-sky-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">IEH</span>
                        </div>
                        <span className="font-bold text-white text-lg leading-tight">India Employment Hub</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                        The definitive ecosystem for elite talent and verified employers across India.
                    </p>
                    <div className="flex gap-3">
                        {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                            <a
                                key={i}
                                href="#"
                                className="w-9 h-9 bg-slate-800 hover:bg-sky-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                            >
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Links Columns */}
                <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                    {[
                        { heading: 'Candidates', links: ['Browse Roles', 'Career Intel', 'Resume AI', 'Interview Prep'] },
                        { heading: 'Employers', links: ['Post a Job', 'Talent Search', 'Enterprise', 'Success Stories'] },
                        { heading: 'Company', links: ['About', 'Contact', 'Privacy', 'Terms'] },
                    ].map(({ heading, links }) => (
                        <div key={heading}>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">{heading}</h4>
                            <ul className="space-y-3">
                                {links.map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-sm text-slate-300 hover:text-white flex items-center gap-1 group transition-colors duration-150">
                                            {item} <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

            </div>

            <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                <span>© {new Date().getFullYear()} India Employment Hub. <span className="text-slate-600">v{__APP_VERSION__}</span></span>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>
);
