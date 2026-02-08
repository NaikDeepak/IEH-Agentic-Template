import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { Testimonials } from '../components/Testimonials';
import { Footer } from '../components/Footer';
import { TopRecruiters } from '../components/TopRecruiters';

export const LandingPage: React.FC = () => {
    return (
        <main className="min-h-screen bg-white selection:bg-black selection:text-white font-sans">
            <HeroSection />
            <FeaturesSection />
            <WhyChooseUs />
            <TopRecruiters />
            <Testimonials />
            <Footer />
        </main>
    );
};
