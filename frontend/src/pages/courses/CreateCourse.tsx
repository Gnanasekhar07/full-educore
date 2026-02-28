import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { courseService } from '../../services/apiServices';

const CreateCourse = () => {
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setError('');
        try {
            await courseService.createCourse(formData);
            setStatus('success');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err: any) {
            setStatus('error');
            setError(err.response?.data?.message || 'Failed to create course. Please try again.');
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto py-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-purple-500 rounded-2xl text-white shadow-lg shadow-purple-200">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Create New Course</h1>
                        <p className="text-slate-500">Launch a new learning journey for your students.</p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {status === 'error' && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                                <AlertCircle size={20} />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Course Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Advanced Web Architecture"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Description</label>
                            <textarea
                                required
                                rows={5}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detailed overview of what students will learn..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${status === 'loading' ? 'bg-slate-400' : 'bg-primary hover:scale-[1.02] active:scale-95 shadow-primary/20'
                                }`}
                        >
                            {status === 'loading' ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating Course...
                                </>
                            ) : (
                                <>
                                    <Plus size={20} />
                                    Launch Course
                                </>
                            )}
                        </button>
                    </form>

                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700"
                        >
                            <CheckCircle2 size={20} />
                            <span className="text-sm font-medium">Course created successfully! Redirecting...</span>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default CreateCourse;
