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
            <div className="relative flex flex-col md:flex-row border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">

                {/* Search Input Section */}
                <div className="flex-grow flex items-center px-6 py-4 border-b-2 md:border-b-0 md:border-r-2 border-black group focus-within:bg-gray-50 transition-colors">
                    <Search className="w-5 h-5 text-black mr-4 flex-shrink-0" />
                    <input
                        aria-label="Job search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); }}
                        onKeyDown={handleKeyDown}
                        placeholder="SEARCH ROLES (E.G. DESIGNER)..."
                        className="flex-grow bg-transparent border-none outline-none text-black placeholder:text-gray-500 text-base font-mono uppercase tracking-tight w-full"
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="p-1 hover:bg-gray-200 rounded-none transition-colors"
                        >
                            <X className="w-4 h-4 text-black" />
                        </button>
                    )}
                </div>

                {/* Location Dropdown Section */}
                <div className="relative md:w-64 border-b-2 md:border-b-0 md:border-r-2 border-black bg-white" ref={dropdownRef}>
                    <button
                        onClick={() => { setIsDropdownOpen((open) => !open); }}
                        className="w-full h-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="listbox"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <MapPin className="w-4 h-4 text-black flex-shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Location</span>
                                <span className="text-sm font-bold text-black uppercase tracking-wide truncate">{location}</span>
                            </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-black transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -2 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -2 }}
                                transition={{ duration: 0.1 }}
                                className="absolute top-full left-0 right-0 border-2 border-t-0 border-black bg-white z-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
                                        className={`w-full text-left px-6 py-3 text-sm font-mono uppercase border-b border-gray-100 last:border-0 hover:bg-black hover:text-white transition-colors ${location === loc ? 'bg-gray-100 font-bold' : 'text-black'}`}
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
                    className="px-8 py-4 bg-black text-white hover:bg-[#003366] transition-colors duration-200 font-bold uppercase tracking-widest text-sm whitespace-nowrap active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                >
                    Find Jobs
                </button>
            </div>
        </div>
    );
};
