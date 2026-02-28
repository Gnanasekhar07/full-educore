import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Play, CheckCircle2, Clock, BookOpen, Loader2, Trophy, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { courseService, quizService } from '../../services/apiServices';

interface QuizWithCourse {
    id: string;
    title: string;
    courseId: string;
    courseTitle: string;
    questionCount: number;
    createdAt: string;
}

const MyQuizzes = () => {
    const [quizzes, setQuizzes] = useState<QuizWithCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchAllQuizzes = async () => {
            try {
                const courses = await courseService.getAllCourses();
                const allQuizzes: QuizWithCourse[] = [];

                // Fetch quizzes for each course
                for (const course of courses) {
                    try {
                        const courseQuizzes = await quizService.getQuizzesByCourse(course.id);
                        courseQuizzes.forEach((q: any) => {
                            allQuizzes.push({
                                id: q.id,
                                title: q.title,
                                courseId: course.id,
                                courseTitle: course.title,
                                questionCount: q._count?.questions || 0,
                                createdAt: q.createdAt,
                            });
                        });
                    } catch {
                        // Skip courses where quiz fetch fails
                    }
                }

                setQuizzes(allQuizzes);
            } catch (err) {
                console.error('Failed to load quizzes:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllQuizzes();
    }, []);

    const filteredQuizzes = quizzes.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-8 py-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider mb-3">
                            <HelpCircle size={12} />
                            Assessments
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900">Quizzes</h1>
                        <p className="text-slate-500 mt-1">Browse and take quizzes from your courses.</p>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search quizzes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-primary mb-4" size={40} />
                        <p className="text-slate-500 font-medium">Loading quizzes...</p>
                    </div>
                ) : filteredQuizzes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <HelpCircle size={48} className="text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No quizzes available</h3>
                        <p className="text-slate-500 max-w-sm">
                            {searchQuery ? 'No quizzes match your search.' : 'Quizzes will appear here once your courses have assessments.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredQuizzes.map((quiz, idx) => (
                            <motion.div
                                key={quiz.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-card p-6 flex items-center justify-between group hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                                        <HelpCircle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors">
                                            {quiz.title}
                                        </h4>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <BookOpen size={12} /> {quiz.courseTitle}
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock size={12} /> {quiz.questionCount} Questions
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    to={`/dashboard/quizzes/take/${quiz.id}`}
                                    className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 shadow-md shadow-primary/10 transition-all active:scale-95"
                                >
                                    <Play size={14} fill="currentColor" /> Take Quiz
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MyQuizzes;
