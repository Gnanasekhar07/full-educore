import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Upload, Sparkles, CheckCircle2, XCircle,
    RefreshCw, BookOpen, Loader2, ClipboardList, ChevronRight
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { authService } from '../services/apiServices';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

const StudyAssistant = () => {
    const user = authService.getCurrentUser();
    const navigate = useNavigate();

    // Redirect non-students
    if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
        navigate('/dashboard');
        return null;
    }

    const [notes, setNotes] = useState('');
    const [summary, setSummary] = useState('');
    const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'summary' | 'quiz'>('summary');

    // Quiz state
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleSummarize = async () => {
        if (!notes.trim()) return;
        setLoadingSummary(true);
        setError('');
        setSummary('');
        try {
            const res = await api.post('/ai/summarize-notes', { notes });
            setSummary(res.data.summary);
            setActiveTab('summary');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Summarization failed. Please add your GEMINI_API_KEY to the backend.');
        } finally {
            setLoadingSummary(false);
        }
    };

    const handleGenerateQuiz = async () => {
        if (!notes.trim()) return;
        setLoadingQuiz(true);
        setError('');
        setQuiz([]);
        setAnswers({});
        setSubmitted(false);
        try {
            const res = await api.post('/ai/generate-quiz', { notes });
            setQuiz(res.data.questions || []);
            setActiveTab('quiz');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Quiz generation failed. Please add your GEMINI_API_KEY to the backend.');
        } finally {
            setLoadingQuiz(false);
        }
    };

    const handleSubmitQuiz = () => {
        let correct = 0;
        quiz.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) correct++;
        });
        setScore(correct);
        setSubmitted(true);
    };

    const handleReset = () => {
        setAnswers({});
        setSubmitted(false);
        setScore(0);
    };

    const formatSummary = (text: string) => {
        // Render markdown-like formatting nicely
        return text.split('\n').map((line, i) => {
            if (line.startsWith('## ') || line.startsWith('# ')) {
                return <h3 key={i} className="text-lg font-bold text-slate-900 mt-4 mb-2">{line.replace(/^#{1,2} /, '')}</h3>;
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
                return (
                    <div key={i} className="flex gap-2 text-slate-700 text-sm mb-1.5">
                        <ChevronRight size={14} className="text-primary flex-shrink-0 mt-0.5" />
                        <span>{line.slice(2)}</span>
                    </div>
                );
            }
            if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className="font-bold text-slate-800 text-sm mt-2">{line.replace(/\*\*/g, '')}</p>;
            }
            if (line.trim() === '') return <div key={i} className="h-2" />;
            return <p key={i} className="text-slate-700 text-sm mb-1">{line}</p>;
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto py-6 space-y-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-violet-100 rounded-xl">
                            <Brain size={24} className="text-violet-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">AI Study Assistant</h1>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-600 rounded-full">Beta</span>
                    </div>
                    <p className="text-slate-500 ml-1">Paste your study notes → get an AI summary or auto-generated quiz to practice.</p>
                </motion.div>

                {/* Notes Input */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                        <Upload size={16} className="text-primary" /> Your Study Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={8}
                        placeholder="Paste your lecture notes, textbook content, or any study material here…

Example:
Photosynthesis is the process by which plants use sunlight, water and carbon dioxide to produce oxygen and energy in the form of glucose. The process occurs in two stages: the light-dependent reactions and the light-independent reactions (Calvin cycle)..."
                        className="w-full resize-none border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all leading-relaxed bg-slate-50/50"
                    />
                    <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-slate-400">{notes.length} characters</span>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSummarize}
                                disabled={!notes.trim() || loadingSummary || loadingQuiz}
                                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-violet-500/20"
                            >
                                {loadingSummary ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                {loadingSummary ? 'Summarizing…' : 'Summarize'}
                            </button>
                            <button
                                onClick={handleGenerateQuiz}
                                disabled={!notes.trim() || loadingSummary || loadingQuiz}
                                className="flex items-center gap-2 px-5 py-2.5 btn-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-sm transition-all shadow-lg shadow-primary/20"
                            >
                                {loadingQuiz ? <Loader2 size={16} className="animate-spin" /> : <ClipboardList size={16} />}
                                {loadingQuiz ? 'Generating…' : 'Generate Quiz'}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Error */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-2">
                        <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <div>
                            <strong>Error:</strong> {error}
                            {error.includes('GEMINI_API_KEY') && (
                                <p className="mt-1 text-red-500">Add <code className="bg-red-100 px-1 rounded">GEMINI_API_KEY=your_key</code> to your backend <code className="bg-red-100 px-1 rounded">.env</code> file and restart the server.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Results */}
                <AnimatePresence>
                    {(summary || quiz.length > 0) && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {/* Tab Switcher */}
                            {summary && quiz.length > 0 && (
                                <div className="flex gap-2 mb-4">
                                    <button onClick={() => setActiveTab('summary')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'summary' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                        <Sparkles size={14} /> Summary
                                    </button>
                                    <button onClick={() => setActiveTab('quiz')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'quiz' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                        <ClipboardList size={14} /> Practice Quiz
                                    </button>
                                </div>
                            )}

                            {/* Summary Panel */}
                            {activeTab === 'summary' && summary && (
                                <div className="glass-card p-8">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <Sparkles size={20} className="text-violet-600" /> AI Summary
                                    </h2>
                                    <div className="prose max-w-none">{formatSummary(summary)}</div>
                                </div>
                            )}

                            {/* Quiz Panel */}
                            {activeTab === 'quiz' && quiz.length > 0 && (
                                <div className="glass-card p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <ClipboardList size={20} className="text-primary" /> Practice Quiz
                                            <span className="text-sm font-normal text-slate-400">({quiz.length} questions)</span>
                                        </h2>
                                        {submitted && (
                                            <button onClick={handleReset} className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                                                <RefreshCw size={14} /> Retake
                                            </button>
                                        )}
                                    </div>

                                    {/* Score Banner */}
                                    {submitted && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`p-5 rounded-xl mb-6 text-center ${score === quiz.length ? 'bg-green-50 border border-green-200' : score >= quiz.length / 2 ? 'bg-blue-50 border border-blue-200' : 'bg-amber-50 border border-amber-200'}`}
                                        >
                                            <div className="text-3xl font-bold mb-1">{score}/{quiz.length}</div>
                                            <div className="text-sm font-medium text-slate-600">
                                                {score === quiz.length ? '🎉 Perfect Score! Excellent work!' : score >= quiz.length / 2 ? '👍 Good job! Review the missed ones.' : '📚 Keep studying and try again!'}
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="space-y-6">
                                        {quiz.map((q, qi) => {
                                            const userAnswer = answers[qi];
                                            const isCorrect = userAnswer === q.correctAnswer;
                                            return (
                                                <div key={qi} className={`p-5 rounded-xl border transition-all ${submitted ? isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50' : 'border-slate-100 bg-slate-50/30'}`}>
                                                    <div className="flex gap-3 mb-4">
                                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{qi + 1}</span>
                                                        <p className="font-semibold text-slate-800 text-sm">{q.question}</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2 ml-9">
                                                        {q.options.map((opt, oi) => {
                                                            let optStyle = 'border-slate-200 bg-white hover:border-primary/40 hover:bg-primary/5';
                                                            if (submitted) {
                                                                if (opt === q.correctAnswer) optStyle = 'border-green-400 bg-green-50 text-green-800';
                                                                else if (opt === userAnswer && !isCorrect) optStyle = 'border-red-400 bg-red-50 text-red-800';
                                                                else optStyle = 'border-slate-100 bg-slate-50 text-slate-400';
                                                            } else if (userAnswer === opt) {
                                                                optStyle = 'border-primary bg-primary/5 text-primary';
                                                            }
                                                            return (
                                                                <button
                                                                    key={oi}
                                                                    disabled={submitted}
                                                                    onClick={() => setAnswers({ ...answers, [qi]: opt })}
                                                                    className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${optStyle} disabled:cursor-default`}
                                                                >
                                                                    <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {submitted && (
                                                        <div className={`mt-3 ml-9 flex gap-2 text-xs ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                            {isCorrect ? <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" /> : <XCircle size={14} className="flex-shrink-0 mt-0.5" />}
                                                            <span><strong>{isCorrect ? 'Correct!' : `Correct: ${q.correctAnswer}`}</strong> — {q.explanation}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {!submitted && (
                                        <button
                                            onClick={handleSubmitQuiz}
                                            disabled={Object.keys(answers).length < quiz.length}
                                            className="mt-6 btn-primary py-3 px-8 flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                                        >
                                            <BookOpen size={18} /> Submit Quiz ({Object.keys(answers).length}/{quiz.length} answered)
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default StudyAssistant;
