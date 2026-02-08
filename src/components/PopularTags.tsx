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
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 self-center mr-2">Popular:</span>
            {TAGS.map((tag, i) => (
                <motion.button
                    key={tag}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (i * 0.05) }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 border-2 border-black bg-white text-black text-xs font-bold font-mono uppercase tracking-wider hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                    {tag}
                </motion.button>
            ))}
        </motion.div>
    );
};
