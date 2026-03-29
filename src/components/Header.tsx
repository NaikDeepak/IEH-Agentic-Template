import React, { useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from './NotificationBell';

const Login = lazy(() => import('./Login').then(module => ({ default: module.Login })));

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { userData } = useAuth();

    const role = userData?.role;

    const navItems = (() => {
        if (role === 'seeker') {
            return [
                { label: 'Dashboard', path: '/seeker/dashboard' },
                { label: 'Find Jobs', path: '/jobs' },
                { label: 'AI Prep', path: '/seeker/interview' },
                { label: 'Pricing', path: '/pricing' },
            ];
        }
        if (role === 'employer') {
            return [
                { label: 'Find Jobs', path: '/jobs' },
                { label: 'Find Talent', path: '/employer/search' },
                { label: 'Manage Jobs', path: '/employer/jobs' },
                { label: 'Post a Job', path: '/post-job' },
                { label: 'My Company', path: '/employer/company' },
            ];
        }
        // Unauthenticated / admin
        return [
            { label: 'Find Jobs', path: '/jobs' },
            { label: 'Post a Job', path: '/post-job' },
            { label: 'AI Prep', path: '/login' },
            { label: 'Pricing', path: '/pricing' },
        ];
    })();

    return (
        <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-soft">
            <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5 cursor-pointer">
                    <div className="w-9 h-9 bg-sky-700 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm tracking-tight">WM</span>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="font-bold text-slate-900 text-base leading-tight">WorkMila</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1 mr-6 ml-auto">
                    {navItems.map((item) => (
                        item.path.startsWith('/') ? (
                            <Link
                                key={item.label}
                                to={item.path}
                                className="text-sm font-medium text-slate-600 hover:text-sky-700 hover:bg-sky-50 px-3 py-2 rounded-lg transition-colors duration-150"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <a
                                key={item.label}
                                href={item.path}
                                className="text-sm font-medium text-slate-600 hover:text-sky-700 hover:bg-sky-50 px-3 py-2 rounded-lg transition-colors duration-150"
                            >
                                {item.label}
                            </a>
                        )
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    {role && <NotificationBell />}
                    <Suspense fallback={<div className="w-20 h-8 animate-pulse bg-slate-100 rounded-lg" />}>
                        <Login variant="navbar" />
                    </Suspense>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={() => { setIsMenuOpen((open) => !open); }}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-menu"
                    >
                        {isMenuOpen ? <X aria-hidden="true" className="w-5 h-5" /> : <Menu aria-hidden="true" className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div
                    id="mobile-menu"
                    className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-soft-md animate-in fade-in slide-in-from-top-4 duration-200 z-40"
                >
                    <nav className="flex flex-col p-4 gap-1" aria-label="Mobile navigation">
                        {navItems.map((item) => (
                            item.path.startsWith('/') ? (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    className="text-base font-medium text-slate-700 hover:text-sky-700 hover:bg-sky-50 px-4 py-3 rounded-lg transition-colors"
                                    onClick={() => { setIsMenuOpen(false); }}
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <a
                                    key={item.label}
                                    href={item.path}
                                    className="text-base font-medium text-slate-700 hover:text-sky-700 hover:bg-sky-50 px-4 py-3 rounded-lg transition-colors"
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
