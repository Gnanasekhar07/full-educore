import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    BookOpen,
    Users,
    Clock,
    ChevronLeft,
    Calendar,
    Layers,
    Sparkles,
    Trophy,
    CheckCircle2,
    HelpCircle,
    Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import QuizList from '../../components/QuizList';
import { courseService, enrollmentService, quizService, authService } from '../../services/apiServices';
import { toast } from '../../components/Toast';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const [course, setCourse] = useState<any>(null);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [isUserEnrolled, setIsUserEnrolled] = useState(false);
    const [newStudentEmail, setNewStudentEmail] = useState('');
    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const promises = [
                    courseService.getCourseById(id),
                    quizService.getQuizzesByCourse(id)
                ];

                if (user) {
                    promises.push(enrollmentService.getMyCourses().catch(() => []));
                }

                const results = await Promise.all(promises);
                const courseData = results[0];
                const quizzesData = results[1];
                const enrolledCoursesData = results[2];

                setCourse(courseData);
                setQuizzes(quizzesData);

                if (enrolledCoursesData) {
                    setIsUserEnrolled(enrolledCoursesData.some((c: any) => c.id === id));
                }

                if (user?.role === 'TEACHER' && courseData.teacherId === user.id) {
                    try {
                        const studentsData = await enrollmentService.getCourseStudents(id);
                        setStudents(studentsData);
                    } catch (err) {
                        console.error("Failed to load course students", err);
                    }
                }
            } catch (err) {
                setError('Failed to load course details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleEnroll = async () => {
        if (!id) return;
        setIsEnrolling(true);
        try {
            await enrollmentService.enroll(id);
            const data = await courseService.getCourseById(id);
            setCourse(data);
            toast.success('Enrolled Successfully!', 'You now have access to this course.');
            setIsUserEnrolled(true);
        } catch (err: any) {
            toast.error('Enrollment Failed', err.response?.data?.message || 'Please try again.');
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStudentEmail || !id) return;
        setIsAddingStudent(true);
        try {
            const res = await enrollmentService.addStudentToCourse(id, newStudentEmail);
            setStudents([res.enrollment, ...students]);
            setNewStudentEmail('');
            toast.success('Success', 'Student added to course');

            // Re-fetch course to update student count
            const updatedCourse = await courseService.getCourseById(id);
            setCourse(updatedCourse);
        } catch (err: any) {
            toast.error('Failed to add student', err.response?.data?.message || 'Could not add student');
        } finally {
            setIsAddingStudent(false);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500">Loading course details...</p>
            </div>
        </DashboardLayout>
    );

    if (error || !course) return (
        <DashboardLayout>
            <div className="text-center py-20">
                <p className="text-red-500 mb-4">{error || 'Course not found'}</p>
                <button onClick={() => navigate(-1)} className="btn-primary px-6 py-2">Go Back</button>
            </div>
        </DashboardLayout>
    );

    const enrollmentCount = course._count?.enrollments ?? course.enrollments?.length ?? 0;

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium"
                >
                    <ChevronLeft size={16} /> Back to Academy
                </button>

                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-4">
                                <Sparkles size={12} />
                                Highly Recommended
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
                                {course.title}
                            </h1>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                {course.description}
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Instructor', value: course.teacher?.name || 'Unknown', icon: BookOpen },
                                { label: 'Students', value: enrollmentCount, icon: Users },
                                { label: 'Quizzes', value: quizzes.length, icon: Layers },
                                { label: 'Created', value: new Date(course.createdAt).toLocaleDateString(), icon: Clock }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + idx * 0.05 }}
                                    className="glass-card p-4 flex flex-col items-center text-center"
                                >
                                    <item.icon size={20} className="text-primary mb-2" />
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.label}</div>
                                    <div className="text-sm font-bold text-slate-800">{item.value}</div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="glass-card p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Trophy size={20} className="text-yellow-500" />
                                What you'll learn
                            </h3>
                            <ul className="grid md:grid-cols-2 gap-4">
                                {(course.description
                                    ? course.description.split(/[.\n]/).map((s: string) => s.trim()).filter((s: string) => s.length > 10).slice(0, 6)
                                    : ['Understand core concepts', 'Apply skills in practice']
                                ).map((point: string, idx: number) => (
                                    <li key={idx} className="flex gap-2 text-slate-600 text-sm">
                                        <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-12">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <HelpCircle size={20} className="text-primary" />
                                    Course Assessments
                                </h3>
                                {user?.role === 'TEACHER' && course?.teacherId === user?.id && (
                                    <Link to={`/dashboard/quizzes/create/${id}`} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
                                        <Plus size={16} /> Create Quiz
                                    </Link>
                                )}
                            </div>
                            <QuizList quizzes={quizzes.map(q => ({
                                id: q.id,
                                title: q.title,
                                questionCount: q._count?.questions || q.questions?.length || 0,
                                isCompleted: !!q.bestAttempt,
                                score: q.bestAttempt ? Math.round((q.bestAttempt.score / q.bestAttempt.total) * 100) : undefined
                            }))} />
                        </div>

                        {user?.role === 'TEACHER' && course?.teacherId === user?.id && (
                            <div className="mt-12 glass-card p-8">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Users size={20} className="text-primary" />
                                    Student Management
                                </h3>

                                <form onSubmit={handleAddStudent} className="flex gap-3 mb-8">
                                    <input
                                        type="email"
                                        placeholder="Student's email address..."
                                        value={newStudentEmail}
                                        onChange={(e) => setNewStudentEmail(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={isAddingStudent}
                                        className="btn-primary px-6 flex items-center gap-2"
                                    >
                                        {isAddingStudent ? 'Adding...' : <><Plus size={16} /> Add Student</>}
                                    </button>
                                </form>

                                <div className="space-y-4">
                                    {students.length > 0 ? students.map((enrollment: any) => (
                                        <div key={enrollment.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                                    {enrollment.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-800">{enrollment.user.name}</div>
                                                    <div className="text-xs text-slate-500">{enrollment.user.email}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-400 font-medium">
                                                Joined {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl">
                                            No students enrolled yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className="w-full lg:w-80">
                        <div className="glass-card p-6 sticky top-28 bg-slate-900 border-none text-white overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                            <div className="relative z-10 space-y-6">
                                <div>
                                    <div className="text-slate-400 text-sm mb-1">Access Type</div>
                                    <div className="text-2xl font-bold">{isUserEnrolled ? 'Enrolled' : 'Lifetime Enrollment'}</div>
                                </div>
                                {isUserEnrolled ? (
                                    <button
                                        disabled
                                        className="w-full py-4 bg-emerald-500 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={20} /> Already Enrolled
                                    </button>
                                ) : (
                                    <button
                                        disabled={isEnrolling}
                                        onClick={handleEnroll}
                                        className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        {isEnrolling ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : 'Enroll in Course'}
                                    </button>
                                )}
                                <div className="text-center text-xs text-slate-400">
                                    Join {enrollmentCount} other learners today
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CourseDetail;
