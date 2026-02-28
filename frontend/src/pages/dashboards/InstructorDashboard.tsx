import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    BookOpen,
    Trophy,
    TrendingUp,
    ArrowUpRight,
    Loader2,
    GraduationCap
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import AnnouncementFeed from '../../components/AnnouncementFeed';
import { courseService, authService, announcementService } from '../../services/apiServices';
import CourseCard from '../../components/CourseCard';
import { Link } from 'react-router-dom';

const InstructorDashboard = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', courseId: '' });
    const [isCreating, setIsCreating] = useState(false);
    const user = authService.getCurrentUser();

    useEffect(() => {
        const fetchInstructorData = async () => {
            try {
                const [allCourses, allAnnouncements] = await Promise.all([
                    courseService.getAllCourses(),
                    announcementService.getAllAnnouncements()
                ]);
                // Filter courses where teacherId matches current user
                const myCourses = allCourses.filter((c: any) => c.teacherId === user?.id);
                setCourses(myCourses);
                setAnnouncements(allAnnouncements);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInstructorData();
    }, [user?.id]);

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const created = await announcementService.createAnnouncement(newAnnouncement);
            setAnnouncements([created, ...announcements]);
            setNewAnnouncement({ title: '', content: '', courseId: '' });
        } catch (err) {
            console.error('Failed to create announcement', err);
        } finally {
            setIsCreating(false);
        }
    };

    const totalStudents = courses.reduce((acc: number, c: any) => acc + (c._count?.enrollments || 0), 0);

    const stats = [
        { label: 'Total Students', value: totalStudents.toString(), change: '+0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Active Courses', value: courses.length.toString(), change: '+0', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Avg. Quiz Score', value: '84%', change: '+0', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { label: 'Completion Rate', value: '92%', change: '+0', icon: GraduationCap, color: 'text-green-600', bg: 'bg-green-100' },
    ];

    const recentActivities = [
        { user: 'Alex Johnson', action: 'enrolled in', target: 'Advanced React Patterns', time: '2 mins ago' },
        { user: 'Sarah Williams', action: 'completed', target: 'Node.js Mastery Quiz', time: '15 mins ago', score: '95%' },
        { user: 'Michael Chen', action: 'started', target: 'Database Architecture', time: '1 hour ago' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-10 py-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Instructor Overview</h1>
                    <p className="text-slate-500">Track your courses and student performance in real-time.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-6 flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-start">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="flex items-center text-green-600 text-xs font-bold">
                                    {stat.change} <ArrowUpRight size={14} />
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
                                <div className="text-3xl font-black text-slate-900 mt-1">{stat.value}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <BookOpen size={20} className="text-primary" />
                                Your Courses
                            </h2>
                            <Link to="/dashboard/courses/create" className="btn-primary px-4 py-2 text-sm">Create New Course</Link>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="glass-card p-10 text-center border-dashed">
                                <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-500">You haven't created any courses yet.</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {courses.map((course, idx) => (
                                    <CourseCard
                                        key={course.id}
                                        id={course.id}
                                        title={course.title}
                                        description={course.description}
                                        teacherName={user?.name || ''}
                                        enrolledCount={course._count?.enrollments || 0}
                                        idx={idx}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">Recent Activity</h2>
                        <div className="glass-card p-6 space-y-6">
                            {recentActivities.map((activity, idx) => (
                                <div key={idx} className="flex gap-4 items-start group">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center font-bold text-slate-500">
                                        {activity.user.charAt(0)}
                                    </div>
                                    <div className="flex-1 pb-4 border-b border-slate-50 last:border-0">
                                        <div className="text-sm text-slate-600">
                                            <span className="font-bold text-slate-800">{activity.user}</span> {activity.action} <span className="font-bold text-slate-800">{activity.target}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-slate-400">{activity.time}</span>
                                            {activity.score && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-600 rounded">
                                                    Score: {activity.score}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <AnnouncementFeed announcements={announcements} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-6">Create Announcement</h2>
                        <form onSubmit={handleCreateAnnouncement} className="glass-card p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newAnnouncement.title}
                                    onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Announcement Title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Course</label>
                                <select
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={newAnnouncement.courseId}
                                    onChange={e => setNewAnnouncement({ ...newAnnouncement, courseId: e.target.value })}
                                >
                                    <option value="">All My Students (Global)</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Content</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={newAnnouncement.content}
                                    onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Write your announcement here..."
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full btn-primary py-2 flex justify-center items-center gap-2"
                            >
                                {isCreating ? <Loader2 className="animate-spin" size={20} /> : 'Post Announcement'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InstructorDashboard;
