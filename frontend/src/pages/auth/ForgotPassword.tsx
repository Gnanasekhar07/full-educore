import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Mail, ArrowLeft, Loader2, CheckCircle2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/apiServices';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setError('');
        try {
            await authService.forgotPassword(email);
            setStatus('sent');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
            setStatus('idle');
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
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-card p-10">
                    <div className="flex flex-col items-center mb-8">
                        <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/30 mb-4">
                            <LayoutDashboard size={32} />
                        </div>

                        {status === 'sent' ? (
                            <>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mt-2"
                                >
                                    <CheckCircle2 size={32} className="text-green-600" />
                                </motion.div>
                                <h1 className="text-2xl font-bold text-slate-900 text-center">Check Your Email</h1>
                                <p className="text-slate-500 mt-2 text-center text-sm">
                                    If <strong className="text-slate-700">{email}</strong> is registered, you'll receive password reset instructions shortly.
                                </p>
                                <Link
                                    to="/login"
                                    className="mt-6 btn-primary py-3 px-8 flex items-center gap-2 shadow-lg shadow-primary/20"
                                >
                                    <ArrowLeft size={16} /> Back to Login
                                </Link>
                            </>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
                                <p className="text-slate-500 mt-2 text-center text-sm">
                                    Enter your email address and we'll verify your account.
                                </p>
                            </>
                        )}
                    </div>

                    {status !== 'sent' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
                                    {error}
                                </div>
                            )}
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

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full btn-primary py-3.5 text-base shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
                            >
                                {status === 'sending' ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <><Send size={18} /> Send Reset Link</>
                                )}
                            </button>
                        </form>
                    )}

                    {status !== 'sent' && (
                        <p className="text-center mt-8 text-slate-500 text-sm">
                            Remember your password?{' '}
                            <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
