import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Login } from './Login';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { userData } = useAuth();

    const navItems = [
        { label: 'Find Jobs', path: '/jobs' },
        { label: 'Post a Job', path: '/post-job' },
        { label: 'AI Prep', path: '#ai-prep' },
        { label: 'Pricing', path: '#pricing' },
    ];

    if (userData?.role === 'employer') {
        // Insert "Find Talent" after "Find Jobs"
        navItems.splice(1, 0, { label: 'Find Talent', path: '/employer/search' });
    }

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100/50">
            <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group cursor-pointer">
                    <img src="/images/logo.png" alt="IEH Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-tight">IEH</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">India Employment Hub</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8 mr-8 ml-auto">
                    {navItems.map((item) => (
                        item.path.startsWith('/') ? (
                            <Link
                                key={item.label}
                                to={item.path}
                                className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <a
                                key={item.label}
                                href={item.path}
                                className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                                {item.label}
                            </a>
                        )
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <Login variant="navbar" />

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={() => { setIsMenuOpen((open) => !open); }}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-menu"
                    >
                        {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div
                    id="mobile-menu"
                    className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200"
                >
                    <nav className="flex flex-col p-4 space-y-4" aria-label="Mobile navigation">
                        {navItems.map((item) => (
                            item.path.startsWith('/') ? (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    className="text-sm font-semibold text-gray-700 hover:text-indigo-600 px-4 py-2 hover:bg-indigo-50 rounded-lg transition-colors"
                                    onClick={() => { setIsMenuOpen(false); }}
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <a
                                    key={item.label}
                                    href={item.path}
                                    className="text-sm font-semibold text-gray-700 hover:text-indigo-600 px-4 py-2 hover:bg-indigo-50 rounded-lg transition-colors"
                                    onClick={() => { setIsMenuOpen(false); }}
                                >
                                    {item.label}
                                </a>
                            )
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
};
