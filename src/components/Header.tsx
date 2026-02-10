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
        const employerNavItems = [
            { label: 'Find Talent', path: '/employer/search' },
            { label: 'Manage Jobs', path: '/employer/jobs' }
        ];
        // Insert "Find Talent" and "Manage Jobs" after "Find Jobs" (at index 1)
        navItems.splice(1, 0, ...employerNavItems);
        // Insert "My Company" after "Post a Job".
        // The index is now 4 (original 3 + 2 inserted items - 1 for 'Post a Job' itself)
        navItems.splice(4, 0, { label: 'My Company', path: '/employer/company' });
    }

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b-2 border-black">
            <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 bg-black flex items-center justify-center">
                        <span className="text-white font-black text-xl tracking-tighter">IEH</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-black uppercase tracking-tight leading-none text-lg">India</span>
                        <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest leading-none">Employment Hub</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8 mr-8 ml-auto">
                    {navItems.map((item) => (
                        item.path.startsWith('/') ? (
                            <Link
                                key={item.label}
                                to={item.path}
                                className="text-sm font-mono font-bold text-black uppercase tracking-wider hover:underline decoration-2 underline-offset-4 transition-all"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <a
                                key={item.label}
                                href={item.path}
                                className="text-sm font-mono font-bold text-black uppercase tracking-wider hover:underline decoration-2 underline-offset-4 transition-all"
                            >
                                {item.label}
                            </a>
                        )
                    ))}
                </nav>

                <div className="flex items-center gap-6">
                    <Login variant="navbar" />

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-black hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-black"
                        onClick={() => { setIsMenuOpen((open) => !open); }}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-menu"
                    >
                        {isMenuOpen ? <X aria-hidden="true" className="w-6 h-6" /> : <Menu aria-hidden="true" className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div
                    id="mobile-menu"
                    className="md:hidden absolute top-20 left-0 w-full bg-white border-b-2 border-black animate-in fade-in slide-in-from-top-4 duration-200 z-40"
                >
                    <nav className="flex flex-col p-6 space-y-4" aria-label="Mobile navigation">
                        {navItems.map((item) => (
                            item.path.startsWith('/') ? (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    className="text-lg font-black uppercase tracking-tight text-black hover:bg-black hover:text-white px-4 py-3 border-2 border-transparent hover:border-black transition-colors"
                                    onClick={() => { setIsMenuOpen(false); }}
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <a
                                    key={item.label}
                                    href={item.path}
                                    className="text-lg font-black uppercase tracking-tight text-black hover:bg-black hover:text-white px-4 py-3 border-2 border-transparent hover:border-black transition-colors"
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
