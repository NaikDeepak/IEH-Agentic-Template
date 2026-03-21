import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ChevronDown, X } from 'lucide-react';

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

    const clearSearch = () => {
        setSearchTerm('');
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
        <div className="w-full max-w-7xl mx-auto">
            <div className="relative flex flex-col md:flex-row bg-white border border-slate-200 rounded-2xl shadow-soft overflow-hidden focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 transition-all">

                {/* Search Input Section */}
                <div className="flex-grow flex items-center px-5 py-3.5 border-b md:border-b-0 md:border-r border-slate-200">
                    <Search className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
                    <input
                        aria-label="Job search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search roles, skills, companies..."
                        className="flex-grow bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 text-sm w-full"
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    )}
                </div>

                {/* Location Dropdown Section */}
                <div className="relative md:w-52 border-b md:border-b-0 md:border-r border-slate-200 bg-white" ref={dropdownRef}>
                    <button
                        onClick={() => { setIsDropdownOpen((open) => !open); }}
                        className="w-full h-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="listbox"
                    >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Location</span>
                                <span className="text-sm font-semibold text-slate-700 truncate">{location}</span>
                            </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.1 }}
                                className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-soft-md mt-1 z-50 overflow-hidden"
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
                                        className={`w-full text-left px-5 py-2.5 text-sm border-b border-slate-100 last:border-0 transition-colors ${location === loc ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        {loc}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="px-8 py-3.5 bg-sky-700 hover:bg-sky-800 text-white transition-colors duration-200 font-semibold text-sm whitespace-nowrap"
                >
                    Find Jobs
                </button>
            </div>
        </div>
    );
};
