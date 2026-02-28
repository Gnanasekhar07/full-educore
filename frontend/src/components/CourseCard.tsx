import { motion } from 'framer-motion';
import { Users, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CourseCardProps {
    id: string;
    title: string;
    description: string;
    teacherName: string;
    enrolledCount: number;
    idx: number;
}

const CourseCard = ({ id, title, description, teacherName, enrolledCount, idx }: CourseCardProps) => {
    return (
        <Link to={`/dashboard/courses/${id}`} className="block">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card group overflow-hidden hover:scale-[1.02] transition-transform"
            >
                <div className="h-40 bg-gradient-to-br from-primary/20 to-purple-500/20 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:scale-110 transition-transform">
                        <div className="w-24 h-24 bg-primary/30 rounded-full blur-2xl" />
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded">Course</span>
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                            <Users size={14} />
                            {enrolledCount} Students
                        </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                {teacherName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-slate-700">{teacherName}</span>
                        </div>
                        <span className="text-primary group-hover:translate-x-1 transition-transform inline-block">
                            <ArrowRight size={20} />
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default CourseCard;

