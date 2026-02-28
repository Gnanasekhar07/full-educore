import { Response } from 'express';
import prisma from '../config/prisma.js';

export const enrollInCourse = async (req: any, res: Response) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        // Check if course exists
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId, courseId }
            }
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        const enrollment = await prisma.enrollment.create({
            data: { userId, courseId }
        });

        res.status(201).json({ message: 'Successfully enrolled', enrollment });
    } catch (error: any) {
        res.status(500).json({ message: 'Enrollment failed', error: error.message });
    }
};

export const getMyEnrolledCourses = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const enrollments = await prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        teacher: { select: { name: true } }
                    }
                }
            }
        });

        const courses = enrollments.map((e: any) => ({
            ...e.course,
            enrolledAt: e.enrolledAt
        }));

        res.json(courses);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch enrolled courses', error: error.message });
    }
};

export const getCourseStudents = async (req: any, res: Response) => {
    try {
        const { courseId } = req.params;
        const teacherId = req.user.id;

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.teacherId !== teacherId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to view students for this course' });
        }

        const enrollments = await prisma.enrollment.findMany({
            where: { courseId },
            include: {
                user: { select: { id: true, name: true, email: true } }
            },
            orderBy: { enrolledAt: 'desc' }
        });

        res.json(enrollments);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch students', error: error.message });
    }
};

export const manuallyAddStudent = async (req: any, res: Response) => {
    try {
        const { courseId } = req.params;
        const { email } = req.body;
        const teacherId = req.user.id;

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.teacherId !== teacherId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to add students to this course' });
        }

        const student = await prisma.user.findUnique({ where: { email } });
        if (!student) return res.status(404).json({ message: 'User not found with this email' });
        if (student.role !== 'STUDENT') return res.status(400).json({ message: 'Only students can be enrolled' });

        const existingEnrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: student.id, courseId } }
        });

        if (existingEnrollment) return res.status(400).json({ message: 'Student is already enrolled in this course' });

        const enrollment = await prisma.enrollment.create({
            data: { userId: student.id, courseId },
            include: {
                user: { select: { id: true, name: true, email: true } }
            }
        });

        res.status(201).json({ message: 'Student randomly added successfully', enrollment });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to add student', error: error.message });
    }
};

export const getMyPerformance = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;

        // Count enrolled courses
        const coursesCount = await prisma.enrollment.count({
            where: { userId }
        });

        // Get quiz attempts
        const attempts = await prisma.quizAttempt.findMany({
            where: { userId }
        });

        let quizBadges = 0;
        attempts.forEach(attempt => {
            if (attempt.total > 0 && attempt.score / attempt.total >= 0.8) {
                quizBadges++;
            }
        });

        const totalBadges = coursesCount + quizBadges;

        res.json({ badges: totalBadges, coursesCount, quizBadges });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch performance', error: error.message });
    }
};
