import React from 'react';
import { Twitter, Linkedin, Facebook, Instagram, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => (
    <footer className="bg-white border-t-2 border-black font-sans text-black">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 py-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">

                {/* Brand Column */}
                <div className="md:col-span-4 flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="w-8 h-8 bg-black"></span>
                            <span className="font-black text-2xl tracking-tighter uppercase leading-none">India<br/>Employment<br/>Hub</span>
                        </div>
                        <p className="font-mono text-sm leading-relaxed max-w-xs mb-8 text-gray-600 uppercase">
                            The definitive ecosystem for elite talent and verified employers.
                        </p>
                    </div>

                    <div className="flex gap-4 mt-auto">
                        {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                            <a
                                key={i}
                                href="#"
                                className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                            >
                                <Icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Links Columns */}
                <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
                    <div>
                        <h4 className="font-black text-sm tracking-widest uppercase mb-8 border-b-2 border-black pb-2 w-fit">Candidates</h4>
                        <ul className="space-y-4 font-mono text-xs font-bold uppercase tracking-wider">
                            {['Browse Roles', 'Career Intel', 'Resume AI', 'Interview Prep'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="hover:underline decoration-2 underline-offset-4 flex items-center gap-1 group">
                                        {item} <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-sm tracking-widest uppercase mb-8 border-b-2 border-black pb-2 w-fit">Employers</h4>
                        <ul className="space-y-4 font-mono text-xs font-bold uppercase tracking-wider">
                            {['Post a Job', 'Talent Search', 'Enterprise', 'Success Stories'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="hover:underline decoration-2 underline-offset-4 flex items-center gap-1 group">
                                        {item} <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-sm tracking-widest uppercase mb-8 border-b-2 border-black pb-2 w-fit">Company</h4>
                        <ul className="space-y-4 font-mono text-xs font-bold uppercase tracking-wider">
                            {['About', 'Contact', 'Privacy', 'Terms'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="hover:underline decoration-2 underline-offset-4 flex items-center gap-1 group">
                                        {item} <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>

            <div className="mt-20 pt-8 border-t-2 border-black flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">
                <span>© {new Date().getFullYear()} India Employment Hub.</span>
                <div className="flex gap-8">
                    <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>
);
