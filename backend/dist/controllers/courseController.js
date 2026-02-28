import prisma from '../config/prisma.js';
export const createCourse = async (req, res) => {
    try {
        const { title, description } = req.body;
        const teacherId = req.user.id;
        const course = await prisma.course.create({
            data: {
                title,
                description,
                teacherId,
            },
            include: {
                teacher: {
                    select: { name: true, email: true }
                }
            }
        });
        res.status(201).json(course);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create course', error: error.message });
    }
};
export const getAllCourses = async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                teacher: {
                    select: { name: true }
                },
                _count: {
                    select: { enrollments: true }
                }
            }
        });
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
    }
};
export const getCourseById = async (req, res) => {
    try {
        const id = req.params.id;
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                teacher: {
                    select: { name: true, email: true }
                },
                quizzes: true,
                announcements: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        author: { select: { name: true } }
                    }
                }
            }
        });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch course', error: error.message });
    }
};
export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const teacherId = req.user.id;
        const course = await prisma.course.findUnique({ where: { id } });
        if (!course)
            return res.status(404).json({ message: 'Course not found' });
        if (course.teacherId !== teacherId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }
        const updatedCourse = await prisma.course.update({
            where: { id },
            data: { title, description }
        });
        res.json(updatedCourse);
    }
    catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
};
export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await prisma.course.findUnique({ where: { id } });
        if (!course)
            return res.status(404).json({ message: 'Course not found' });
        if (course.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await prisma.course.delete({ where: { id } });
        res.json({ message: 'Course deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Deletion failed', error: error.message });
    }
};
//# sourceMappingURL=courseController.js.map