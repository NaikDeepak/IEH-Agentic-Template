import React from 'react';
import { motion } from 'framer-motion';
import { Bot, FileText, Zap, Users, Trophy, Target } from 'lucide-react';

const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    delay: number;
}> = ({ icon, title, description, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1 group"
        >
            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-sky-100 transition-colors text-sky-600">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{description}</p>
        </motion.div>
    );
};

export const FeaturesSection: React.FC = () => {
    const features = [
        {
            icon: <Bot className="w-6 h-6" />,
            title: "AI Hiring Assistant",
            description: "Auto-generate JDs, screen candidates, and filter ghost jobs instantly."
        },
        {
            icon: <FileText className="w-6 h-6" />,
            title: "Resume Analyzer",
            description: "Get instant ATS scores and keyword optimization for your profile."
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Active Ecosystem",
            description: "Complete transparency. Jobs and profiles expire after 4 days of inactivity."
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Insider Connections",
            description: "Find alumni and connections at your target companies automatically."
        },
        {
            icon: <Trophy className="w-6 h-6" />,
            title: "Skill Challenges",
            description: "Prove your worth with real-world coding challenges and earn badges."
        },
        {
            icon: <Target className="w-6 h-6" />,
            title: "Smart Matching",
            description: "Our AI matches you based on skills, culture, and experience level."
        }
    ];

    return (
        <section className="py-24 px-4 md:px-6 bg-slate-50/50">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-slate-900 mb-4"
                    >
                        Why Choose the <span className="text-sky-600">Active</span> Platform?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600 max-w-2xl mx-auto"
                    >
                        We've reimagined the hiring process to speed up connections and eliminate ghosting.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            delay={index * 0.1}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
