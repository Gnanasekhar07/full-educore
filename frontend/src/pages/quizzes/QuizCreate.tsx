import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HelpCircle,
    Plus,
    Trash2,
    CheckCircle2,
    PlusCircle,
    LayoutDashboard,
    Save
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { quizService, courseService } from '../../services/apiServices';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '../../components/Toast';

const QuizCreate = () => {
    const { courseId } = useParams();
    const [title, setTitle] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(courseId || '');
    const [courses, setCourses] = useState<any[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [timeLimit, setTimeLimit] = useState('');
    const [questions, setQuestions] = useState<any[]>([
        { text: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await courseService.getAllCourses();
                setCourses(data);
                if (!selectedCourse && data.length > 0) {
                    setSelectedCourse(data[0].id);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchCourses();
    }, [selectedCourse]);

    const addQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    };

    const removeQuestion = (idx: number) => {
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const updateQuestion = (idx: number, field: string, value: any) => {
        const newQuestions = [...questions];
        newQuestions[idx][field] = value;
        setQuestions(newQuestions);
    };

    const updateOption = (qIdx: number, oIdx: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIdx].options[oIdx] = value;
        setQuestions(newQuestions);
    };

    const handleSave = async () => {
        if (!selectedCourse || !title) {
            toast.error('Missing Info', 'Please select a course and enter a title.');
            setStatus('error');
            return;
        }

        // Validate questions
        const isValid = questions.every(q => q.text.trim() && q.options.every((o: string) => o.trim()));
        if (!isValid) {
            toast.error('Invalid Questions', 'Please fill in all question text and options.');
            setStatus('error');
            return;
        }

        setStatus('saving');
        try {
            await quizService.createQuiz({
                courseId: selectedCourse,
                title,
                startDate: startDate || null,
                endDate: endDate || null,
                timeLimit: timeLimit ? parseInt(timeLimit) : null,
                questions
            });
            setStatus('success');
            toast.success('Quiz Created!', 'Your quiz has been published successfully.');
            setTimeout(() => navigate(`/dashboard/courses/${selectedCourse}`), 1500);
        } catch (err: any) {
            toast.error('Failed to save quiz', err.response?.data?.message || 'Please try again.');
            setStatus('idle');
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto py-10 mb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-100">
                            <HelpCircle size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Quiz Constructor</h1>
                            <p className="text-slate-500">Add questions and define correct answers.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={status !== 'idle'}
                        className="btn-primary flex items-center gap-2 px-8"
                    >
                        {status === 'saving' ? 'Saving...' : <><Save size={18} /> Publish Quiz</>}
                    </button>
                </div>

                <div className="space-y-8">
                    <div className="glass-card p-8 space-y-6">
                        <div>
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 block">Target Course</label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            >
                                <option value="" disabled>Select a course</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 block">Quiz Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. JavaScript Closures Deep Dive"
                                className="w-full text-2xl font-bold bg-transparent border-b-2 border-slate-100 focus:border-primary outline-none py-2 transition-all placeholder:text-slate-300"
                            />
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                            <div>
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 block">Start Time (Optional)</label>
                                <input
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 block">End Time (Optional)</label>
                                <input
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 block">Time Limit (Minutes)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(e.target.value)}
                                    placeholder="e.g. 10"
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence>
                            {questions.map((q, qIdx) => (
                                <motion.div
                                    key={qIdx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass-card p-8 group relative"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="text-xs font-black text-slate-300 uppercase tracking-widest">Question {qIdx + 1}</div>
                                        <button
                                            onClick={() => removeQuestion(qIdx)}
                                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <textarea
                                            value={q.text}
                                            onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                                            placeholder="Type your question here..."
                                            className="w-full text-lg font-medium bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 resize-none"
                                        />

                                        <div className="grid md:grid-cols-2 gap-4">
                                            {q.options.map((option: string, oIdx: number) => (
                                                <div key={oIdx} className="relative group/option">
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                                        placeholder={`Option ${oIdx + 1}`}
                                                        className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all outline-none ${q.correctAnswer === oIdx
                                                            ? 'border-green-500 bg-green-50/50'
                                                            : 'border-slate-100 focus:border-slate-200 bg-white'
                                                            }`}
                                                    />
                                                    <button
                                                        onClick={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                                                        className={`absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${q.correctAnswer === oIdx ? 'bg-green-500 border-green-500 text-white' : 'border-slate-200 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        {q.correctAnswer === oIdx && <CheckCircle2 size={12} />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={addQuestion}
                        className="w-full py-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all font-bold flex items-center justify-center gap-2 group"
                    >
                        <PlusCircle size={24} className="group-hover:scale-110 transition-transform" />
                        Add Question
                    </button>
                </div>
            </div>

        </DashboardLayout>
    );
};

export default QuizCreate;
