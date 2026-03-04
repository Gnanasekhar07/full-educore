import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Trophy,
    Clock,
    Star,
    ArrowRight,
    Target,
    Zap,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import AnnouncementFeed from '../../components/AnnouncementFeed';
import StreakDisplay from '../../components/StreakDisplay';
import { enrollmentService, authService, announcementService, quizService } from '../../services/apiServices';
import { Link, useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [performance, setPerformance] = useState<{ badges: number, coursesCount: number, quizBadges: number } | null>(null);
    const [upcomingQuizzes, setUpcomingQuizzes] = useState<any[]>([]);
    const [quizzesByCourse, setQuizzesByCourse] = useState<Record<string, { total: number; completed: number }>>({});
    const [loading, setLoading] = useState(true);
    const user = authService.getCurrentUser();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesData, annData, perfData, quizzesData] = await Promise.all([
                    enrollmentService.getMyCourses(),
                    announcementService.getAllAnnouncements(),
                    enrollmentService.getMyPerformance(),
                    quizService.getUpcomingQuizzes()
                ]);
                setCourses(coursesData);
                setAnnouncements(annData);
                setPerformance(perfData);
                setUpcomingQuizzes(quizzesData);

                // Build per-course quiz progress from performance data
                const progressMap: Record<string, { total: number; completed: number }> = {};
                if (perfData?.courseProgress) {
                    Object.assign(progressMap, perfData.courseProgress);
                } else if (coursesData.length > 0) {
                    // Fallback: fetch quiz data for each enrolled course
                    await Promise.all(coursesData.map(async (c: any) => {
                        try {
                            const qs = await quizService.getQuizzesByCourse(c.id);
                            const completed = qs.filter((q: any) => q.bestAttempt).length;
                            progressMap[c.id] = { total: qs.length, completed };
                        } catch { progressMap[c.id] = { total: 0, completed: 0 }; }
                    }));
                }
                setQuizzesByCourse(progressMap);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const calculateDueIn = (endDate: string) => {
        const diff = new Date(endDate).getTime() - new Date().getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

        if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`;
        if (hours > 0) return `In ${hours} hour${hours > 1 ? 's' : ''}`;
        return 'Less than an hour';
    };

    return (
        <DashboardLayout>
            <div className="space-y-10 py-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name || 'Student'}! 👋</h1>
                        <p className="text-slate-500">You're making great progress. Keep it up!</p>
                    </div>
                </div>

                <StreakDisplay />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Your Learning Path</h2>
                            <Link to="/dashboard/academy" className="text-sm text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                Academy <ArrowRight size={14} />
                            </Link>
                        </div>

                        <div className="grid gap-6">
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="animate-spin text-primary" size={32} />
                                </div>
                            ) : courses.length === 0 ? (
                                <div className="glass-card p-10 text-center border-dashed">
                                    <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                                    <p className="text-slate-500">You haven't enrolled in any courses yet.</p>
                                </div>
                            ) : (
                                courses.map((course, idx) => {
                                    const prog = quizzesByCourse[course.id];
                                    const pct = prog && prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                                            className="glass-card p-6 group hover:translate-x-1 transition-all cursor-pointer"
                                        >
                                            <div className="flex gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                                    <BookOpen size={28} />
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">{course.title}</h3>
                                                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                                                <Clock size={12} /> Enrolled on {new Date(course.enrolledAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-bold text-slate-900">{pct}%</div>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pct}%` }}
                                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                                            className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-primary'}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold mb-6">Performance Details</h2>
                            <div className="glass-card p-8 bg-slate-900 border-none text-white">
                                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-4">Achievements</div>
                                <div className="flex flex-wrap gap-3 mt-4">
                                    {performance && performance.badges > 0 ? (
                                        Array.from({ length: performance.badges }).map((_, i) => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-yellow-500/30 border shadow-[0_0_10px_rgba(234,179,8,0.2)] flex items-center justify-center text-yellow-500" title={`Badge ${i + 1}`}>
                                                <Trophy size={18} />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-slate-400">No badges earned yet. Complete courses and quizzes to earn them!</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Clock size={20} className="text-primary" />
                                Upcoming Quizzes
                            </h2>
                            <div className="space-y-4">
                                {upcomingQuizzes.length === 0 ? (
                                    <div className="text-sm text-slate-500 italic p-4 text-center glass-card border-dashed">No upcoming quizzes!</div>
                                ) : (
                                    upcomingQuizzes.map((quiz, idx) => (
                                        <div
                                            key={quiz.id || idx}
                                            onClick={() => navigate(`/dashboard/quizzes/take/${quiz.id}`)}
                                            className="glass-card p-4 hover:border-primary/30 transition-all cursor-pointer group"
                                        >
                                            <div className="text-xs font-bold text-primary mb-1">{quiz.course?.title}</div>
                                            <div className="font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">{quiz.title}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">Due {calculateDueIn(quiz.endDate)}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="pt-6">
                            <AnnouncementFeed announcements={announcements} />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentDashboard;
