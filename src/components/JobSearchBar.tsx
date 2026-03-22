import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import type { JobSearchFilters } from '../features/jobs/types';
import { DEFAULT_JOB_SEARCH_FILTERS } from '../features/jobs/types';

export type { JobSearchFilters };

const DEFAULT_FILTERS: JobSearchFilters = DEFAULT_JOB_SEARCH_FILTERS;

interface JobSearchBarProps {
    onSearch?: (query: string, filters: JobSearchFilters) => void;
}

const WORK_MODES = ['All', 'Remote', 'Hybrid', 'Office'];
const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];
const EXPERIENCE_LEVELS = ['All', 'Entry', 'Mid', 'Senior'];

export const JobSearchBar: React.FC<JobSearchBarProps> = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState<JobSearchFilters>(DEFAULT_FILTERS);
    const [workModeDropdownOpen, setWorkModeDropdownOpen] = useState(false);
    const workModeRef = useRef<HTMLDivElement>(null);

    const handleSearch = () => {
        onSearch?.(searchTerm, filters);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const activeFilterCount = [
        filters.workMode !== 'All',
        filters.jobType !== 'All',
        filters.city.trim() !== '',
        filters.experienceLevel !== 'All',
        filters.salaryMin !== '',
    ].filter(Boolean).length;

    const resetFilters = () => { setFilters(DEFAULT_FILTERS); };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (workModeRef.current && !workModeRef.current.contains(event.target as Node)) {
                setWorkModeDropdownOpen(false);
            }
        };
        if (workModeDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, [workModeDropdownOpen]);

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-2">
            {/* Main Search Bar */}
            <div className="relative flex flex-col md:flex-row bg-white border border-slate-200 rounded-2xl shadow-soft overflow-visible focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 transition-all">

                {/* Search Input */}
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
                            onClick={() => { setSearchTerm(''); }}
                            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    )}
                </div>

                {/* Work Mode Dropdown */}
                <div className="relative md:w-44 border-b md:border-b-0 md:border-r border-slate-200 bg-white rounded-none" ref={workModeRef}>
                    <button
                        onClick={() => { setWorkModeDropdownOpen((o) => !o); }}
                        className="w-full h-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
                        aria-expanded={workModeDropdownOpen}
                        aria-haspopup="listbox"
                    >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Work Mode</span>
                                <span className="text-sm font-semibold text-slate-700 truncate">{filters.workMode}</span>
                            </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${workModeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {workModeDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.1 }}
                                className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-soft-md mt-1 z-50 overflow-hidden"
                                role="listbox"
                            >
                                {WORK_MODES.map((mode) => (
                                    <button
                                        key={mode}
                                        role="option"
                                        aria-selected={filters.workMode === mode}
                                        onClick={() => { setFilters((f) => ({ ...f, workMode: mode })); setWorkModeDropdownOpen(false); }}
                                        className={`w-full text-left px-5 py-2.5 text-sm border-b border-slate-100 last:border-0 transition-colors ${filters.workMode === mode ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* More Filters Toggle */}
                <button
                    onClick={() => { setFiltersOpen((o) => !o); }}
                    className={`flex items-center gap-2 px-5 py-3.5 border-b md:border-b-0 md:border-r border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium whitespace-nowrap ${filtersOpen ? 'text-sky-700 bg-sky-50' : 'text-slate-600'}`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] font-bold">{activeFilterCount}</span>
                    )}
                </button>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="px-8 py-3.5 bg-sky-700 hover:bg-sky-800 text-white transition-colors duration-200 font-semibold text-sm whitespace-nowrap rounded-b-2xl md:rounded-b-none md:rounded-r-2xl"
                >
                    Find Jobs
                </button>
            </div>

            {/* Expanded Filter Panel */}
            <AnimatePresence>
                {filtersOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-soft p-5 flex flex-col sm:flex-row flex-wrap gap-4">
                            {/* City */}
                            <div className="flex flex-col gap-1.5 min-w-[160px] flex-1">
                                <label htmlFor="filter-city" className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">City</label>
                                <input
                                    id="filter-city"
                                    type="text"
                                    value={filters.city}
                                    onChange={(e) => { setFilters((f) => ({ ...f, city: e.target.value })); }}
                                    placeholder="Mumbai, Delhi, Bangalore..."
                                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100 transition-all"
                                />
                            </div>

                            {/* Job Type */}
                            <div className="flex flex-col gap-1.5 min-w-[140px] flex-1">
                                <label htmlFor="filter-job-type" className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Job Type</label>
                                <select
                                    id="filter-job-type"
                                    value={filters.jobType}
                                    onChange={(e) => { setFilters((f) => ({ ...f, jobType: e.target.value })); }}
                                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100 transition-all"
                                >
                                    {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {/* Experience Level */}
                            <div className="flex flex-col gap-1.5 min-w-[140px] flex-1">
                                <label htmlFor="filter-experience" className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Experience</label>
                                <select
                                    id="filter-experience"
                                    value={filters.experienceLevel}
                                    onChange={(e) => { setFilters((f) => ({ ...f, experienceLevel: e.target.value })); }}
                                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100 transition-all"
                                >
                                    {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>

                            {/* Min Salary */}
                            <div className="flex flex-col gap-1.5 min-w-[140px] flex-1">
                                <label htmlFor="filter-salary-min" className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Min Salary (&#8377; LPA)</label>
                                <input
                                    id="filter-salary-min"
                                    type="number"
                                    value={filters.salaryMin}
                                    onChange={(e) => { setFilters((f) => ({ ...f, salaryMin: e.target.value })); }}
                                    placeholder="e.g. 6"
                                    min={0}
                                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100 transition-all"
                                />
                            </div>

                            {/* Reset */}
                            {activeFilterCount > 0 && (
                                <div className="flex items-end">
                                    <button
                                        onClick={resetFilters}
                                        className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                                    >
                                        Reset
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
