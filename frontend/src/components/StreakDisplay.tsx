import { motion } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';
import { authService } from '../services/apiServices';

const StreakDisplay = () => {
    const user = authService.getCurrentUser();

    if (!user || user.currentStreak === undefined) {
        return null;
    }

    const { currentStreak, longestStreak } = user;
    const isHot = currentStreak > 2;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass-card p-6 border-l-4 ${isHot ? 'border-l-orange-500' : 'border-l-blue-500'} relative overflow-hidden`}
        >
            {isHot && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            )}

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <motion.div
                        animate={isHot ? {
                            scale: [1, 1.2, 1],
                            rotate: [-5, 5, -5]
                        } : {}}
                        transition={isHot ? {
                            repeat: Infinity,
                            duration: 2
                        } : {}}
                        className={`p-4 rounded-2xl flex items-center justify-center shadow-lg ${isHot ? 'bg-orange-500 text-white shadow-orange-500/30' : 'bg-blue-500 text-white shadow-blue-500/30'}`}
                    >
                        <Flame size={32} className={isHot ? 'animate-pulse' : ''} />
                    </motion.div>

                    <div>
                        <h3 className="text-xl font-bold text-slate-900">
                            {currentStreak} Day Streak!
                        </h3>
                        <p className="text-sm font-medium text-slate-500">
                            {isHot ? "You're on fire! 🔥" : "Keep coming back to build your streak!"}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end text-right">
                    <div className="flex items-center gap-1 text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">
                        <Trophy size={14} className="text-yellow-500" /> Best
                    </div>
                    <div className="text-2xl font-black text-slate-800">
                        {longestStreak}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StreakDisplay;
