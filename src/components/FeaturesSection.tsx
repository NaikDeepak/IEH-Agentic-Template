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
            whileHover={{ y: -5 }}
            className={`relative overflow-hidden p-8 h-[400px] flex flex-col justify-between group text-left w-full border-2 border-black outline-none transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className} ${dark ? 'text-white' : 'text-black'}`}
            aria-label={`View jobs for ${title}`}
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img src={image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0" />
                <div className={`absolute inset-0 ${dark ? 'bg-black/70 group-hover:bg-black/50' : 'bg-white/80 group-hover:bg-white/60'} transition-colors duration-500`} />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full">
                <div className="flex justify-between items-start w-full border-b-2 border-current pb-4 mb-4">
                    <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{title}</h3>
                    <ArrowUpRight className="w-6 h-6 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>

                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                        <span key={i} className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 border ${dark ? 'border-white text-white' : 'border-black text-black'}`}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="relative z-10">
               <span className="text-xs font-mono font-bold uppercase tracking-widest border-b border-current pb-0.5 group-hover:pb-1 transition-all">Explore Roles</span>
            </div>
        </motion.button>
    );
};

export const FeaturesSection: React.FC = () => {
    return (
        <section className="py-24 px-4 md:px-8 bg-white font-sans text-black border-b-2 border-black">
            <div className="container mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-16 flex flex-col md:flex-row justify-between items-end border-b-2 border-black pb-8 gap-8">
                    <div>
                        <h2 className="text-5xl md:text-7xl font-black text-black uppercase tracking-tighter mb-4 leading-[0.85]">
                            Trending<br/>Sectors
                        </h2>
                    </div>
                    <p className="text-gray-600 max-w-md text-sm font-mono uppercase tracking-wide text-right md:text-left">
                        Curated opportunities across high-growth industries. Verified employers only.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-2 border-black bg-black">

                    {/* Creative & Design */}
                    <div className="md:col-span-4">
                        <ServiceCard
                            title="Creative & Design"
                            image="/images/feature_creative.png"
                            tags={['UI/UX', '3D Art', 'Motion']}
                            className="h-full border-0 border-b-2 md:border-b-0 md:border-r-2 border-black bg-white"
                        />
                    </div>

                    {/* Media & Production */}
                    <div className="md:col-span-4">
                        <ServiceCard
                            title="Media Production"
                            image="/images/feature_video.png"
                            tags={['Editing', 'Sound', 'Camera']}
                            className="h-full border-0 border-b-2 md:border-b-0 md:border-r-2 border-black bg-black"
                            dark
                        />
                    </div>

                    {/* Brand Identity */}
                    <div className="md:col-span-4">
                        <ServiceCard
                            title="Brand Identity"
                            image="/images/feature_graphic.png"
                            tags={['Strategy', 'Visuals', 'Copy']}
                            className="h-full border-0 bg-white"
                        />
                    </div>

                    {/* Digital Marketing (Wide Card) */}
                    <div className="md:col-span-12 border-t-2 border-black">
                        <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden group bg-gray-100 flex flex-col md:flex-row">
                            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-black bg-white z-10">
                                <div>
                                    <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">Digital<br/>Marketing</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {['SEO Specialist', 'Growth', 'PPC', 'Social Media', 'Analytics'].map((tag, i) => (
                                            <span key={i} className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 border-2 border-black bg-transparent hover:bg-black hover:text-white transition-colors cursor-default">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button className="flex items-center gap-4 text-lg font-bold uppercase tracking-wide group-hover:translate-x-2 transition-transform w-fit">
                                    View 140+ Openings <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="w-full md:w-1/2 relative overflow-hidden">
                                <img src="/images/feature_marketing.png" className="absolute inset-0 w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700" />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
