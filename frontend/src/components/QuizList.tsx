import { motion } from 'framer-motion';
import { HelpCircle, Play, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuizCardProps {
    id: string;
    title: string;
    questionCount: number;
    isCompleted?: boolean;
    score?: number;
}

const QuizList = ({ quizzes }: { quizzes: QuizCardProps[] }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <HelpCircle size={20} className="text-primary" />
                Available Quizzes
            </h3>

            <div className="grid gap-4">
                {quizzes.map((quiz, idx) => (
                    <motion.div
                        key={quiz.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-card p-5 flex items-center justify-between group hover:border-primary/30 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${quiz.isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                {quiz.isCompleted ? <CheckCircle2 size={20} /> : <HelpCircle size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{quiz.title}</h4>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock size={12} /> {quiz.questionCount} Questions
                                    </span>
                                    {quiz.isCompleted && (
                                        <span className="text-xs font-bold text-green-600">
                                            Score: {quiz.score}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Link
                            to={`/dashboard/quizzes/take/${quiz.id}`}
                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${quiz.isCompleted
                                ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                : 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/10'
                                }`}
                        >
                            {quiz.isCompleted ? 'Review Result' : <><Play size={14} fill="currentColor" /> Start Quiz</>}
                        </Link>
                    </motion.div>
                ))}

                {quizzes.length === 0 && (
                    <div className="py-10 text-center glass-card border-dashed">
                        <p className="text-slate-400 text-sm italic">No quizzes available for this course yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizList;
