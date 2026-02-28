import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Mail, Lock, User, ArrowRight, Loader2, GraduationCap, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/apiServices';

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('STUDENT');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.register({ name, email, password, role });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-6 py-12">
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="glass-card p-10">
                    <div className="flex flex-col items-center mb-8">
                        <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/30 mb-4">
                            <LayoutDashboard size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
                        <p className="text-slate-500 mt-2">Join the next generation of learning</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium animate-shake">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 mb-2">
                            <button
                                type="button"
                                onClick={() => setRole('STUDENT')}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'STUDENT' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                            >
                                <GraduationCap size={24} />
                                <span className="text-xs font-bold uppercase tracking-wider">Student</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('TEACHER')}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'TEACHER' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                            >
                                <BookOpen size={24} />
                                <span className="text-xs font-bold uppercase tracking-wider">Teacher</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 text-base shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    Create Account
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-8 text-slate-500 text-sm">
                        Already have an account? {' '}
                        <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
