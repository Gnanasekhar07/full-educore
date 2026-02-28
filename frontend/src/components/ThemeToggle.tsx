import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        if (newTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors relative overflow-hidden"
        >
            <motion.div
                initial={false}
                animate={{ y: isDark ? -40 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <Sun size={20} className="text-yellow-500" />
            </motion.div>
            <motion.div
                initial={false}
                animate={{ y: isDark ? 0 : 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <Moon size={20} className="text-blue-400" />
            </motion.div>
        </button>
    );
};

export default ThemeToggle;
