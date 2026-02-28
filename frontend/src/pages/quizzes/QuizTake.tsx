import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronLeft,
    HelpCircle,
    AlertCircle,
    Timer,
    CheckCircle2,
    Trophy
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { quizService } from '../../services/apiServices';
import { toast } from '../../components/Toast';

const QuizTake = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [status, setStatus] = useState<'taking' | 'submitting' | 'finished'>('taking');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!id) return;
            try {
                const data = await quizService.getQuizById(id);
                setQuiz(data);
                if (data.timeLimit) {
                    setTimeLeft(data.timeLimit * 60); // Convert minutes to seconds
                }
            } catch (err) {
                setError('Failed to load quiz.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    // Timer countdown logic
    useEffect(() => {
        if (timeLeft === null || status !== 'taking') return;

        if (timeLeft <= 0) {
            handleAutoSubmit();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => (prev !== null ? prev - 1 : null));
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, status]);

    const handleAutoSubmit = async () => {
        // Only run if we actually have questions loaded
        if (!quiz?.questions) return;
        setStatus('submitting');
        toast.error("Time's Up!", "Your quiz has been automatically submitted.")
        try {
            const submissionAnswers = quiz.questions.map((q: any, idx: number) => {
                const selectedIdx = answers[idx];
                return selectedIdx !== undefined ? q.options[selectedIdx] : '';
            });
            const result = await quizService.submitAttempt(id!, { answers: submissionAnswers });
            setScore(result.score);
            setStatus('finished');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to submit quiz.');
            setStatus('taking');
        }
    };

    const handleAnswer = (optionIdx: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = optionIdx;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (!id) return;
        setStatus('submitting');
        try {
            // Backend expects answers as an ordered array of selected option strings
            // It compares answers[idx] === question.correctAnswer (string)
            const submissionAnswers = quiz.questions.map((q: any, idx: number) => {
                const selectedIdx = answers[idx];
                return selectedIdx !== undefined ? q.options[selectedIdx] : '';
            });

            const result = await quizService.submitAttempt(id, { answers: submissionAnswers });
            setScore(result.score);
            setStatus('finished');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to submit quiz.');
            setStatus('taking');
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500">Loading quiz...</p>
            </div>
        </DashboardLayout>
    );

    if (error || !quiz) return (
        <DashboardLayout>
            <div className="text-center py-20">
                <p className="text-red-500 mb-4">{error || 'Quiz not found'}</p>
                <button onClick={() => navigate(-1)} className="btn-primary px-6 py-2">Go Back</button>
            </div>
        </DashboardLayout>
    );

    if (status === 'finished') {
        return (
            <DashboardLayout>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl mx-auto py-20 text-center space-y-8"
                >
                    <div className="inline-flex p-6 bg-yellow-100 text-yellow-600 rounded-full shadow-lg shadow-yellow-100">
                        <Trophy size={64} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">Quiz Completed!</h1>
                        <p className="text-slate-500 text-lg">You've successfully finished <strong>{quiz.title}</strong></p>
                    </div>

                    <div className="glass-card p-10 bg-slate-900 border-none relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary" style={{ width: `${score}%` }} />
                        <div className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-2">Your Performance Score</div>
                        <div className="text-6xl font-black text-white">{score}%</div>
                        <div className="mt-6 flex justify-center gap-8 text-sm">
                            <div className="text-slate-400">Total Questions: <span className="text-white font-bold">{quiz.questions.length}</span></div>
                            <div className="text-slate-400">Correct Answers: <span className="text-white font-bold">{Math.round((score / 100) * quiz.questions.length)}</span></div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard/academy')}
                            className="btn-primary px-8"
                        >
                            Return to Academy
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="glass border-slate-200 px-8 rounded-xl font-bold hover:bg-slate-50 transition-all"
                        >
                            Retake Quiz
                        </button>
                    </div>
                </motion.div>
            </DashboardLayout>
        );
    }

    const question = quiz.questions[currentQuestion];

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto py-10">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {currentQuestion + 1}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{quiz.title}</h2>
                            <div className="text-xs text-slate-400 font-medium">Question {currentQuestion + 1} of {quiz.questions.length}</div>
                        </div>
                    </div>
                    {timeLeft !== null && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                            <Timer size={16} />
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-10"
                    >
                        <h3 className="text-2xl font-bold text-slate-900 mb-8 leading-relaxed">
                            {question.text}
                        </h3>

                        <div className="grid gap-4">
                            {question.options.map((option: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${answers[currentQuestion] === idx
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="font-medium">{option}</span>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${answers[currentQuestion] === idx ? 'border-primary bg-primary' : 'border-slate-200 group-hover:border-slate-300'
                                        }`}>
                                        {answers[currentQuestion] === idx && <CheckCircle2 size={14} className="text-white" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    <div className="flex justify-between items-center px-4">
                        <button
                            disabled={currentQuestion === 0}
                            onClick={() => setCurrentQuestion(currentQuestion - 1)}
                            className="text-slate-400 hover:text-slate-600 font-bold flex items-center gap-2 disabled:opacity-0 transition-all"
                        >
                            <ChevronLeft size={20} /> Previous
                        </button>

                        {currentQuestion === quiz.questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={answers[currentQuestion] === undefined || status === 'submitting'}
                                className="px-8 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-lg flex items-center gap-2"
                            >
                                {status === 'submitting' ? 'Submitting...' : 'Finish Quiz'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                                disabled={answers[currentQuestion] === undefined}
                                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Question <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default QuizTake;
