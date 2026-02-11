import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { HowItWorks } from '../components/HowItWorks';
import { FeaturesSection } from '../components/FeaturesSection';
import { EmployerValueSection } from '../components/EmployerValueSection';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { TopRecruiters } from '../components/TopRecruiters';
import { Testimonials } from '../components/Testimonials';
import { CTABanner } from '../components/CTABanner';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
    return (
        <main className="min-h-screen bg-white selection:bg-black selection:text-white font-sans">
            <HeroSection />
            <HowItWorks />
            <FeaturesSection />
            <EmployerValueSection />
            <WhyChooseUs />
            <TopRecruiters />
            <Testimonials />
            <CTABanner />
            <Footer />
        </main>
    );
};
