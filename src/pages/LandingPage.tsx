import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { Twitter, Linkedin, Github } from 'lucide-react';

const Footer: React.FC = () => (
    <footer className="py-20 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center text-slate-500 relative z-10">
            <div className="mb-4 md:mb-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-sky-600 rounded-full"></div>
                <span className="font-bold text-slate-900 tracking-tight text-lg">IEH</span>
                <span className="text-slate-400 mx-2">|</span>
                <span className="text-sm">© {new Date().getFullYear()} India Employment Hub</span>
            </div>
            <div className="flex gap-8" aria-hidden="true">
                <span className="hover:text-sky-600 transition-colors transform hover:-translate-y-1 duration-200 cursor-pointer"><Twitter className="w-5 h-5" /></span>
                <span className="hover:text-sky-600 transition-colors transform hover:-translate-y-1 duration-200 cursor-pointer"><Linkedin className="w-5 h-5" /></span>
                <span className="hover:text-sky-600 transition-colors transform hover:-translate-y-1 duration-200 cursor-pointer"><Github className="w-5 h-5" /></span>
            </div>
        </div>
    </footer>
);

export const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-sky-200 selection:text-sky-900">
            <HeroSection />
            <FeaturesSection />
            <Footer />
        </div>
    );
};
