import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

interface ServiceCardProps {
    title: string;
    image: string;
    tags: string[];
    className?: string;
    dark?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, image, tags, className = "", dark = false }) => {
    return (
        <motion.button
            whileHover={{ y: -4 }}
            className={`relative overflow-hidden p-7 h-auto min-h-[360px] flex flex-col justify-between group text-left w-full rounded-2xl outline-none transition-all shadow-soft hover:shadow-soft-md ${className} ${dark ? 'text-white' : 'text-white'}`}
            aria-label={`View jobs for ${title}`}
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
                <picture>
                    <source srcSet={image.replace('.png', '.webp')} type="image/webp" />
                    <img src={image} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/40 to-transparent transition-colors duration-500" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full">
                <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag, i) => (
                        <span key={i} className="text-[10px] font-semibold px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white tracking-wide">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-end">
                    <h3 className="text-2xl font-bold leading-tight text-white">{title}</h3>
                    <ArrowUpRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <span className="text-xs text-white/60 group-hover:text-white/90 transition-colors mt-2 block">Explore Roles</span>
            </div>
        </motion.button>
    );
};

export const FeaturesSection: React.FC = () => {
    return (
        <section className="py-20 px-4 md:px-8 bg-slate-50 font-sans">
            <div className="container mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-3 block">Explore Sectors</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Trending Sectors</h2>
                    </div>
                    <p className="text-slate-500 max-w-md text-sm leading-relaxed">
                        Verified opportunities from 12K+ employers across India. Specialising in IT & digital services.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <ServiceCard
                        title="Software Engineering"
                        image="/images/sector_software.png"
                        tags={['Frontend', 'Backend', 'Systems']}
                    />
                    <ServiceCard
                        title="Cloud & DevOps"
                        image="/images/sector_cloud.png"
                        tags={['Infrastructure', 'AWS', 'Security']}
                        dark
                    />
                    <ServiceCard
                        title="Data Science & AI"
                        image="/images/sector_data_ai.png"
                        tags={['MLOps', 'Big Data', 'Analytics']}
                    />
                </div>

                {/* Wide ITES Card */}
                <div className="mt-5 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft group flex flex-col md:flex-row min-h-[320px]">
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-5">ITES & Business Operations</h3>
                            <div className="flex flex-wrap gap-2">
                                {['Customer Success', 'Tech Support', 'Global Ops', 'BPO', 'Management'].map((tag, i) => (
                                    <span key={i} className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-sky-100 hover:text-sky-700 transition-colors cursor-default">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <button className="inline-flex items-center gap-2 text-sky-700 hover:text-sky-800 font-semibold text-sm mt-6 transition-colors cursor-pointer">
                            View 450+ Openings <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="w-full md:w-1/2 relative overflow-hidden min-h-[200px]">
                        <picture>
                            <source srcSet="/images/sector_ites.webp" type="image/webp" />
                            <img src="/images/sector_ites.png" alt="ITES & Business Operations" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </picture>
                        <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors"></div>
                    </div>
                </div>

                {/* Employer CTA */}
                <div className="mt-6 flex items-center justify-between bg-white rounded-xl border border-slate-200 p-5 shadow-soft">
                    <p className="text-sm text-slate-500">
                        Can't find your industry? Reach talent across all sectors.
                    </p>
                    <a href="/post-job" className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-800 transition-colors">
                        Post a Job <ArrowUpRight className="w-4 h-4" />
                    </a>
                </div>

            </div>
        </section>
    );
};
