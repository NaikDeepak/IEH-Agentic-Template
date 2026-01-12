import React from 'react';
import { motion } from 'framer-motion';

const TAGS = ['Frontend Dev', 'Product Manager', 'Data Scientist', 'Remote', 'Startup', 'UI/UX'];

export const PopularTags: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-3 mt-8"
        >
            <span className="text-sm text-slate-400 font-medium self-center mr-2">Popular:</span>
            {TAGS.map((tag, i) => (
                <motion.button
                    key={tag}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (i * 0.05) }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all duration-200"
                >
                    {tag}
                </motion.button>
            ))}
        </motion.div>
    );
};
