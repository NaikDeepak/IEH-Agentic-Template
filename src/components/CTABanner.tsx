import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Users } from 'lucide-react';

export const CTABanner: React.FC = () => (
    <section className="py-20 px-4 md:px-8 bg-white font-sans">
        <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Seeker CTA */}
                <div className="bg-sky-50 border border-sky-100 rounded-2xl p-10 flex flex-col justify-between min-h-[280px] shadow-soft">
                    <div>
                        <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-6">
                            <Briefcase className="w-6 h-6 text-sky-700" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-3">
                            Ready to find your dream job?
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                            Browse 12K+ verified roles across India. AI-matched to your skills.
                        </p>
                    </div>
                    <Link
                        to="/jobs"
                        className="mt-8 inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200 text-sm w-fit"
                    >
                        Browse Roles
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Employer CTA */}
                <div className="bg-sky-700 rounded-2xl p-10 flex flex-col justify-between min-h-[280px] shadow-soft-md">
                    <div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
                            Ready to find your dream team?
                        </h3>
                        <p className="text-sky-200 text-sm leading-relaxed max-w-sm">
                            Reach 50K+ active candidates. Post your first job for free.
                        </p>
                    </div>
                    <Link
                        to="/post-job"
                        className="mt-8 inline-flex items-center gap-2 bg-white text-sky-700 hover:bg-sky-50 font-semibold px-6 py-3 rounded-xl transition-colors duration-200 text-sm w-fit"
                    >
                        Post a Job Free
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

            </div>
        </div>
    </section>
);
