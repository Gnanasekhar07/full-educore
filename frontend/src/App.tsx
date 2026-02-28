import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    GraduationCap,
    BookOpen,
    ShieldCheck,
    LayoutDashboard,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Academy from './pages/Academy';

import CreateCourse from './pages/courses/CreateCourse';
import CourseDetail from './pages/courses/CourseDetail';
import QuizTake from './pages/quizzes/QuizTake';
import QuizCreate from './pages/quizzes/QuizCreate';
import MyQuizzes from './pages/quizzes/MyQuizzes';
import InstructorDashboard from './pages/dashboards/InstructorDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import Settings from './pages/settings/Settings';
import ToastContainer from './components/Toast';
import CustomCursor from './components/CustomCursor';

// Auto scroll-to-top on route change
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pathname]);
    return null;
};

const Dashboard = () => {
    const userRole = localStorage.getItem('role') || 'STUDENT';
    return userRole === 'TEACHER' || userRole === 'ADMIN' ? <InstructorDashboard /> : <StudentDashboard />;
};

const Landing = () => {
    const [isHovered, setIsHovered] = useState<string | null>(null);

    const features = [
        { id: 'student', title: 'Student', icon: <GraduationCap className="w-8 h-8" />, color: 'bg-blue-500', desc: 'Enroll in courses, attempt quizzes, and track your progress.' },
        { id: 'teacher', title: 'Teacher', icon: <BookOpen className="w-8 h-8" />, color: 'bg-purple-500', desc: 'Create courses, manage quizzes, and monitor student performance.' },
        { id: 'admin', title: 'Admin', icon: <ShieldCheck className="w-8 h-8" />, color: 'bg-indigo-500', desc: 'Manage users, platform statistics, and full access control.' },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-slate-200/50 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/30">
                        <LayoutDashboard size={24} />
                    </div>
                    <span className="font-bold text-xl tracking-tight">EduCore</span>
                </div>
                <div className="flex gap-4">
                    <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors flex items-center">Login</Link>
                    <Link to="/register" className="btn-primary flex items-center gap-2 text-sm">
                        Get Started <ChevronRight size={16} />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <section className="text-center space-y-8 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                    >
                        <Sparkles size={14} />
                        <span>Next Generation Education Management</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-primary to-slate-900"
                    >
                        Empower Your Learning <br /> Journey with EduCore
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-600 max-w-2xl mx-auto text-lg"
                    >
                        A powerful, role-based education platform designed for students, teachers, and administrators. Seamlessly manage courses, quizzes, and performance.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-center gap-4 pt-4"
                    >
                        <Link to="/register" className="btn-primary px-8 py-3 text-base shadow-xl shadow-primary/20">
                            Start Learning
                        </Link>
                        <button className="glass border-slate-200 px-8 py-3 rounded-lg font-medium hover:bg-slate-50 transition-all">
                            Platform Demo
                        </button>
                    </motion.div>

                    {/* Role Cards */}
                    <div className="grid md:grid-cols-3 gap-8 mt-24">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={feature.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                                onMouseEnter={() => setIsHovered(feature.id)}
                                onMouseLeave={() => setIsHovered(null)}
                                className="glass-card p-8 text-left group relative overflow-hidden"
                            >
                                <div className={`p-4 rounded-2xl w-fit mb-6 text-white ${feature.color} shadow-lg shadow-${feature.id}/20 group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    {feature.desc}
                                </p>
                                <div className="flex items-center text-primary font-semibold text-sm gap-1 group-hover:gap-2 transition-all">
                                    Explore Features <ChevronRight size={16} />
                                </div>
                                <div className={`absolute top-0 right-0 p-8 opacity-5 transition-opacity ${isHovered === feature.id ? 'opacity-20' : ''}`}>
                                    {feature.icon}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Stats Section */}
                <section className="mt-32 glass-card p-12 bg-slate-900 border-none relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
                    <div className="grid md:grid-cols-4 gap-12 relative z-10">
                        {[
                            { label: 'Active Learners', value: '10K+' },
                            { label: 'Courses Created', value: '500+' },
                            { label: 'Quizzes Conducted', value: '25K+' },
                            { label: 'Satisfaction Rate', value: '99%' }
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center group">
                                <div className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform tabular-nums">{stat.value}</div>
                                <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="py-12 px-6 border-t border-slate-200/50 bg-white/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="text-primary" size={24} />
                        <span className="font-bold text-lg">EduCore</span>
                    </div>
                    <div className="flex gap-8 text-sm text-slate-500">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
                    </div>
                    <div className="text-sm text-slate-400">
                        © 2026 EduCore Platform. Built with Passion.
                    </div>
                </div>
            </footer>
        </div>
    );
}

function App() {
    return (
        <Router>
            <CustomCursor />
            <ScrollToTop />
            <ToastContainer />
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/academy" element={<Academy />} />
                <Route path="/dashboard/courses" element={<Academy />} />
                <Route path="/dashboard/courses/create" element={<CreateCourse />} />
                <Route path="/dashboard/courses/:id" element={<CourseDetail />} />
                <Route path="/dashboard/quizzes" element={<MyQuizzes />} />
                <Route path="/dashboard/quizzes/take/:id" element={<QuizTake />} />
                <Route path="/dashboard/quizzes/create/:courseId" element={<QuizCreate />} />
                <Route path="/dashboard/settings" element={<Settings />} />
            </Routes>
        </Router>
    );
}

export default App;
