import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, ArrowLeft } from 'lucide-react';

interface ServiceCardProps {
    title: string;
    image: string;
    tags: string[];
    className?: string;
    dark?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, image, tags, className = "", dark = false }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`relative rounded-[2rem] overflow-hidden p-6 h-[320px] flex flex-col justify-between group cursor-pointer ${className} ${dark ? 'text-white' : 'text-slate-900'}`}
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className={`absolute inset-0 ${dark ? 'bg-gradient-to-t from-black/80 via-black/20 to-transparent' : 'bg-gradient-to-t from-white/90 via-white/40 to-transparent'}`} />
            </div>

            {/* Content */}
            <div className="relative z-10">
                <h3 className="text-xl font-black uppercase tracking-tight mb-4">{title}</h3>
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                        <span key={i} className={`text-[10px] font-bold px-3 py-1 rounded-full border backdrop-blur-sm ${dark ? 'border-white/30 bg-white/10 text-white' : 'border-slate-300 bg-white/50 text-slate-700'}`}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="relative z-10 flex justify-end">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${dark ? 'bg-white text-black hover:scale-110' : 'bg-black text-white hover:scale-110'}`}>
                    <ArrowUpRight className="w-5 h-5" />
                </div>
            </div>
        </motion.div>
    );
};

export const FeaturesSection: React.FC = () => {
    return (
        <section className="py-24 px-4 md:px-6 bg-white font-sans">
            <div className="container mx-auto max-w-6xl">

                {/* Header */}
                <div className="mb-12">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                        Trending Job Roles
                    </h2>
                    <p className="text-slate-500 max-w-2xl text-lg">
                        Explore top career opportunities across high-demand sectors, from technology to creative arts, matching your skills with the best employers.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Creative & Design */}
                    <ServiceCard
                        title="CREATIVE & DESIGN"
                        image="/images/feature_creative.png"
                        tags={['UI/UX Design', '3D Modeling', 'Game Art', 'Animation']}
                        className="md:col-span-4 bg-slate-100"
                    />

                    {/* Media & Production */}
                    <ServiceCard
                        title="MEDIA & PRODUCTION"
                        image="/images/feature_video.png"
                        tags={['Video Editing', 'Motion Graphics', 'Cinematography', 'Sound Design']}
                        className="md:col-span-4 bg-slate-100"
                        dark
                    />

                    {/* Brand Identity */}
                    <ServiceCard
                        title="BRAND IDENTITY"
                        image="/images/feature_graphic.png"
                        tags={['Logo Design', 'Illustration', 'Brand Strategy', 'Visual Identity']}
                        className="md:col-span-4 bg-slate-100"
                    />

                    {/* Digital Marketing */}
                    <div className="md:col-span-8 flex flex-col md:flex-row gap-6 p-1 rounded-[2.5rem] bg-slate-50 border border-slate-100 min-h-[300px] overflow-hidden group hover:shadow-xl transition-all duration-500">
                        {/* This mimics the wide card in the bottom right of the reference */}
                        <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden rounded-[2rem]">
                            <img src="/images/feature_marketing.png" className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                        <div className="w-full md:w-1/2 p-6 md:py-10 flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-slate-900">Digital Marketing</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['SEO Specialist', 'Content Manager', 'Growth Hacker', 'PPC Expert', 'Social Media'].map((tag, i) => (
                                        <span key={i} className="text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200 bg-white text-slate-600">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end mt-6">
                                <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation/More */}
                    <div className="md:col-span-4 flex items-center justify-center gap-4">
                        <button className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                            <ArrowLeft className="w-6 h-6 text-slate-400" />
                        </button>
                        <button className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors">
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
};
