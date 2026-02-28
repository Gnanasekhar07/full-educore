import { useState, useEffect } from 'react';
import CourseCard from './CourseCard';
import { Search, Filter, Sparkles, Loader2 } from 'lucide-react';
import { courseService } from '../services/apiServices';

const CourseList = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await courseService.getAllCourses();
                setCourses(data);
            } catch (err: any) {
                setError('Failed to load courses. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-3">
                        <Sparkles size={12} />
                        Explore Academy
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900">Featured Courses</h1>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                    <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <Filter size={20} className="text-slate-600" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary mb-4" size={40} />
                    <p className="text-slate-500 font-medium">Loading academy catalog...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4">
                        <Filter size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Oops! Something went wrong</h3>
                    <p className="text-slate-500 max-w-sm">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 btn-primary px-6 py-2"
                    >
                        Retry
                    </button>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <Search size={48} className="text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
                    <p className="text-slate-500">Try adjusting your search or filter to find what you're looking for.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredCourses.map((course, idx) => (
                        <CourseCard
                            key={course.id}
                            id={course.id}
                            title={course.title}
                            description={course.description}
                            teacherName={course.teacher?.name || 'Unknown Instructor'}
                            enrolledCount={course._count?.enrollments || course.enrollments?.length || 0}
                            idx={idx}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseList;
