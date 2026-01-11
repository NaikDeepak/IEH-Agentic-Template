import React from 'react';
import { Login } from './Login';

export const Header: React.FC = () => {
    return (
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100/50">
            <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                        <span className="font-bold text-lg">I</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-tight">IEH</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">India Employment Hub</span>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-8 mr-8 ml-auto">
                    {['Find Jobs', 'Post a Job', 'AI Prep', 'Pricing'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                            {item}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <Login variant="navbar" />
                </div>
            </div>
        </header>
    );
};
