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
            <span className="text-xs text-slate-400 self-center mr-1">Popular:</span>
            {TAGS.map((tag, i) => (
                <motion.button
                    key={tag}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (i * 0.05) }}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-3 py-1.5 border border-slate-200 bg-white text-slate-600 text-xs font-medium rounded-full hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50 transition-colors"
                >
                    {tag}
                </motion.button>
            ))}
        </motion.div>
    );
};
