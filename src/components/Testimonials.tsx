import React, { useState, useCallback } from 'react';
import { Quote, ArrowLeft, ArrowRight, Star } from 'lucide-react';

interface TestimonialData {
    quote: string;
    name: string;
    role: string;
    image: string;
    persona: 'employer' | 'seeker';
}

const testimonials: TestimonialData[] = [
    {
        quote: '"We reduced our time-to-hire by 40% using the Active Candidate system. The semantic matching is incredibly precise."',
        name: 'Thomas Karlow',
        role: 'CEO, CAKAR INT.',
        image: '/images/testimonial_ceo.png',
        persona: 'employer',
    },
    {
        quote: '"I went from applying blindly to landing 3 interviews in my first week. The AI matching was scary accurate — it understood what I wanted better than I did."',
        name: 'Priya Sharma',
        role: 'Software Engineer, Bengaluru',
        image: '/images/testimonial_ceo.png',
        persona: 'seeker',
    },
    {
        quote: '"We filled 12 engineering positions in under a month. The talent pool quality is unlike anything we\'ve seen on other platforms."',
        name: 'Rahul Mehta',
        role: 'VP Engineering, FinStack',
        image: '/images/testimonial_ceo.png',
        persona: 'employer',
    },
];

export const Testimonials: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, []);

    const goPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }, []);

    const current = testimonials[currentIndex];
    const personaLabel = current.persona === 'employer' ? 'Employer' : 'Job Seeker';

    return (
        <section className="py-24 px-4 md:px-8 bg-gray-50 border-b-2 border-black font-sans">
            <div className="container mx-auto max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-2 border-black bg-white">

                    {/* Left Header Panel */}
                    <div className="lg:col-span-4 p-12 border-b-2 lg:border-b-0 lg:border-r-2 border-black bg-[#003366] text-white flex flex-col justify-between min-h-[400px]">
                        <div>
                            <Quote className="w-12 h-12 mb-8 text-white/20" />
                            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-6">
                                Impact<br />Stories
                            </h2>
                            <p className="font-mono text-sm opacity-70 max-w-xs leading-relaxed">
                                REAL FEEDBACK FROM ENTERPRISE PARTNERS AND SUCCESSFUL CANDIDATES.
                            </p>
                        </div>

                        {/* Navigation + Counter */}
                        <div className="flex items-center gap-6 pt-12">
                            <div className="flex gap-0">
                                <button
                                    onClick={goPrev}
                                    aria-label="Previous testimonial"
                                    className="w-14 h-14 border-2 border-white hover:bg-white hover:text-[#003366] flex items-center justify-center transition-colors"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={goNext}
                                    aria-label="Next testimonial"
                                    className="w-14 h-14 border-2 border-l-0 border-white hover:bg-white hover:text-[#003366] flex items-center justify-center transition-colors"
                                >
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                            </div>
                            <span className="font-mono text-sm font-bold tabular-nums opacity-70">
                                {String(currentIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    {/* Right Content Panel */}
                    <div className="lg:col-span-8 p-12 lg:p-20 flex flex-col justify-center">

                        {/* Persona Badge */}
                        <div className="flex items-center gap-4 mb-6">
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 border-2 ${current.persona === 'employer'
                                    ? 'border-[#003366] text-[#003366] bg-blue-50'
                                    : 'border-emerald-600 text-emerald-700 bg-emerald-50'
                                }`}>
                                {personaLabel}
                            </span>
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-black text-black" />
                                ))}
                            </div>
                        </div>

                        <blockquote className="text-2xl md:text-3xl font-black uppercase leading-tight tracking-tight mb-12">
                            {current.quote}
                        </blockquote>

                        <div className="flex items-center gap-6 border-t-2 border-black pt-8 w-full">
                            <div className="w-16 h-16 bg-gray-200 border-2 border-black overflow-hidden">
                                <img
                                    src={current.image}
                                    alt={current.name}
                                    className="w-full h-full object-cover filter grayscale"
                                />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg uppercase tracking-wide">{current.name}</h4>
                                <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">{current.role}</p>
                            </div>
                        </div>

                        {/* Dots Indicator */}
                        <div className="flex gap-2 mt-8">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setCurrentIndex(i); }}
                                    aria-label={`Go to testimonial ${i + 1}`}
                                    className={`w-3 h-3 border-2 border-black transition-colors ${i === currentIndex ? 'bg-black' : 'bg-transparent hover:bg-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
