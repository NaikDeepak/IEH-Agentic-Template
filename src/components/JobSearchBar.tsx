import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ChevronDown } from 'lucide-react';

interface JobSearchBarProps {
    onSearch?: (query: string, location: string) => void;
}

export const JobSearchBar: React.FC<JobSearchBarProps> = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [location, setLocation] = useState('All');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSearch = () => {
        onSearch?.(searchTerm, location);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const locations = ['All', 'Remote', 'Hybrid', 'Office'];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="w-full max-w-3xl relative z-20"
        >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full opacity-20 blur-xl group-hover:opacity-30 transition duration-500" />

            <div className="relative flex items-center bg-white/80 backdrop-blur-xl rounded-full shadow-2xl border border-white/50 p-2 pl-6 transition-all focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-300">

                <Search className="w-6 h-6 text-indigo-500 mr-4 flex-shrink-0" />

                <input
                    aria-label="Job search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ex: Product Designer in Bangalore..."
                    className="flex-grow bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 text-lg py-2 font-inter"
                />

                <div className="hidden md:flex items-center border-l border-slate-200 pl-4 ml-4 relative" ref={dropdownRef}>
                    <button
                        onClick={() => { setIsDropdownOpen((open) => !open); }}
                        className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors py-2"
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="listbox"
                    >
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-semibold whitespace-nowrap">{location}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full right-0 mt-4 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden z-50"
                                role="listbox"
                            >
                                {locations.map((loc) => (
                                    <button
                                        key={loc}
                                        role="option"
                                        aria-selected={location === loc}
                                        onClick={() => {
                                            setLocation(loc);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-indigo-50 hover:text-indigo-600 ${location === loc ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-600'}`}
                                    >
                                        {loc}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={handleSearch}
                    className="ml-4 bg-indigo-600 text-white rounded-full px-8 py-3 font-semibold text-lg hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex items-center gap-2">
                    Search
                </button>
            </div>
        </motion.div>
    );
};
