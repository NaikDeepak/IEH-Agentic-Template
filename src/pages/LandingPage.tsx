import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { Twitter, Linkedin, Github } from 'lucide-react';

const Footer: React.FC = () => (
    <footer className="py-12 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center text-slate-500">
            <div className="mb-4 md:mb-0">
                <span className="font-semibold text-slate-900">IEH</span> © {new Date().getFullYear()} India Employment Hub
            </div>
            <div className="flex gap-6">
                <a href="#" className="hover:text-slate-900 transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="hover:text-slate-900 transition-colors"><Linkedin className="w-5 h-5" /></a>
                <a href="#" className="hover:text-slate-900 transition-colors"><Github className="w-5 h-5" /></a>
            </div>
        </div>
    </footer>
);

export const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <HeroSection />
            <FeaturesSection />
            <Footer />
        </div>
    );
};
