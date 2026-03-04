import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    HelpCircle,
    Settings,
    LogOut,
    Search,
    Bell,
    User,
    Menu,
    X,
    ChevronDown,
    Brain
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService, announcementService } from '../services/apiServices';

const SidebarLink = ({ icon: Icon, label, path, active, onClick }: any) => (
    <Link
        to={path}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
            ? 'bg-primary text-white shadow-lg shadow-primary/30 font-semibold'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
    >
        <Icon size={20} />
        <span className="text-sm">{label}</span>
    </Link>
);

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await announcementService.getAllAnnouncements();
                setNotifications(data);
                setUnreadCount(data.length); // Assuming all are unread for simplicity, or we can just show total
            } catch (err) {
                console.error(err);
            }
        };
        fetchNotifications();
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const user = authService.getCurrentUser();
    const isStudent = user?.role !== 'TEACHER' && user?.role !== 'ADMIN';

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'My Courses', icon: BookOpen, path: '/dashboard/courses' },
        { label: 'Quizzes', icon: HelpCircle, path: '/dashboard/quizzes' },
        { label: 'Academy', icon: GraduationCap, path: '/dashboard/academy' },
        ...(isStudent ? [{ label: 'AI Study Assistant', icon: Brain, path: '/dashboard/study-assistant' }] : []),
        { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
    ];

    return (
        <div className="h-screen bg-[#f8fafc] flex overflow-hidden">
            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/50 p-6 flex flex-col"
                    >
                        <div className="flex items-center gap-2 mb-10 px-2">
                            <div className="p-2 bg-primary rounded-xl text-white shadow-inner">
                                <LayoutDashboard size={20} />
                            </div>
                            <span className="font-bold text-xl tracking-tight">EduCore</span>
                        </div>

                        <nav className="flex-1 space-y-2">
                            {menuItems.map((item) => (
                                <SidebarLink
                                    key={item.path}
                                    {...item}
                                    active={location.pathname === item.path}
                                />
                            ))}
                        </nav>

                        <div className="pt-6 border-t border-slate-100">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-500 hover:text-red-600 transition-colors"
                            >
                                <LogOut size={20} />
                                <span className="text-sm font-medium">Logout</span>
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-8 flex items-center justify-between sticky top-0 z-40">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div className="flex items-center gap-2 relative">
                        <ThemeToggle />
                        <button
                            className="p-2 text-slate-400 hover:text-primary transition-colors relative"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white flex items-center justify-center bg-red-500 rounded-full border-2 border-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                                >
                                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <h3 className="font-bold text-slate-800">Notifications</h3>
                                        <button
                                            className="text-xs text-primary font-bold hover:underline"
                                            onClick={() => { setUnreadCount(0); setShowNotifications(false); }}
                                        >
                                            Mark all as read
                                        </button>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-slate-500 text-sm">
                                                No new notifications
                                            </div>
                                        ) : (
                                            notifications.map((notif, idx) => (
                                                <div key={idx} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{notif.title}</h4>
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {new Date(notif.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 line-clamp-2">{notif.content}</p>
                                                    <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                                                        <User size={10} /> By {notif.author?.name}
                                                        {notif.course && <><BookOpen size={10} className="ml-2" /> {notif.course.title}</>}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto w-full pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
