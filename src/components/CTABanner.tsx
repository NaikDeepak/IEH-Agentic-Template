import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Users } from 'lucide-react';

export const CTABanner: React.FC = () => (
    <section className="py-24 px-4 md:px-8 bg-black font-sans text-white border-b-2 border-black">
        <div className="container mx-auto max-w-7xl">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-white">

                {/* Seeker CTA */}
                <div className="p-12 md:p-16 border-b-2 md:border-b-0 md:border-r-2 border-white flex flex-col justify-between min-h-[300px] group hover:bg-white hover:text-black transition-colors duration-500">
                    <div>
                        <div className="w-14 h-14 border-2 border-current flex items-center justify-center mb-8">
                            <Briefcase className="w-7 h-7" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none mb-4">
                            Ready to find<br />your dream job?
                        </h3>
                        <p className="text-sm font-mono opacity-70 uppercase tracking-wide max-w-sm">
                            Browse 12K+ verified roles across India. AI-matched to your skills.
                        </p>
                    </div>
                    <Link
                        to="/jobs"
                        className="mt-8 inline-flex items-center gap-3 border-2 border-current px-8 py-4 font-bold uppercase tracking-widest text-sm w-fit group-hover:bg-black group-hover:text-white transition-colors"
                    >
                        Browse Roles
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                {/* Employer CTA */}
                <div className="p-12 md:p-16 flex flex-col justify-between min-h-[300px] group bg-[#003366] hover:bg-white hover:text-black transition-colors duration-500">
                    <div>
                        <div className="w-14 h-14 border-2 border-current flex items-center justify-center mb-8">
                            <Users className="w-7 h-7" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none mb-4">
                            Ready to find<br />your dream team?
                        </h3>
                        <p className="text-sm font-mono opacity-70 uppercase tracking-wide max-w-sm">
                            Reach 50K+ active candidates. Post your first job for free.
                        </p>
                    </div>
                    <Link
                        to="/post-job"
                        className="mt-8 inline-flex items-center gap-3 border-2 border-current px-8 py-4 font-bold uppercase tracking-widest text-sm w-fit group-hover:bg-black group-hover:text-white transition-colors"
                    >
                        Post a Job Free
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

            </div>

        </div>
    </section>
);
