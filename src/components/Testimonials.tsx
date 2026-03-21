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
    if (!current) return null;
    const personaLabel = current.persona === 'employer' ? 'Employer' : 'Job Seeker';

    return (
        <section className="py-20 px-4 md:px-8 bg-slate-50 font-sans">
            <div className="container mx-auto max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Header Panel */}
                    <div className="lg:col-span-4 bg-sky-700 rounded-2xl p-10 text-white flex flex-col justify-between min-h-[360px] shadow-soft-md">
                        <div>
                            <Quote className="w-10 h-10 mb-6 text-white/30" />
                            <h2 className="text-3xl font-bold leading-tight mb-4">Impact Stories</h2>
                            <p className="text-sm text-sky-200 leading-relaxed">
                                Real feedback from enterprise partners and successful candidates.
                            </p>
                        </div>

                        {/* Navigation + Counter */}
                        <div className="flex items-center gap-4 pt-8">
                            <div className="flex gap-2">
                                <button
                                    onClick={goPrev}
                                    aria-label="Previous testimonial"
                                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={goNext}
                                    aria-label="Next testimonial"
                                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                            <span className="text-sm font-medium tabular-nums text-sky-200">
                                {currentIndex + 1} / {testimonials.length}
                            </span>
                        </div>
                    </div>

                    {/* Right Content Panel */}
                    <div className="lg:col-span-8 bg-white rounded-2xl p-10 lg:p-14 flex flex-col justify-center shadow-soft border border-slate-200">

                        {/* Persona Badge + Stars */}
                        <div className="flex items-center gap-3 mb-6">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                current.persona === 'employer'
                                    ? 'bg-sky-100 text-sky-700'
                                    : 'bg-emerald-100 text-emerald-700'
                            }`}>
                                {personaLabel}
                            </span>
                            <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                        </div>

                        <blockquote className="text-xl md:text-2xl font-semibold text-slate-800 leading-relaxed mb-10">
                            {current.quote}
                        </blockquote>

                        <div className="flex items-center gap-4 border-t border-slate-100 pt-8">
                            <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden flex-shrink-0">
                                <picture>
                                    <source srcSet={current.image.replace('.png', '.webp')} type="image/webp" />
                                    <img src={current.image} alt={current.name} className="w-full h-full object-cover" loading="lazy" />
                                </picture>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">{current.name}</h4>
                                <p className="text-xs text-slate-400 mt-0.5">{current.role}</p>
                            </div>
                        </div>

                        {/* Dots */}
                        <div className="flex gap-2 mt-6">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setCurrentIndex(i); }}
                                    aria-label={`Go to testimonial ${i + 1}`}
                                    className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${i === currentIndex ? 'w-6 bg-sky-600' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
