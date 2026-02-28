import prisma from '../config/prisma.js';
export const createAnnouncement = async (req, res) => {
    try {
        const { title, content, courseId } = req.body;
        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                courseId: courseId || null,
                authorId: req.user.id
            },
            include: {
                author: { select: { name: true } },
                course: { select: { title: true } }
            }
        });
        res.status(201).json(announcement);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating announcement', error: error.message });
    }
};
export const getAnnouncements = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        let whereClause = {};
        if (role === 'TEACHER') {
            whereClause = {
                OR: [
                    { courseId: null },
                    { authorId: userId }
                ]
            };
        }
        else if (role === 'STUDENT') {
            const enrollments = await prisma.enrollment.findMany({
                where: { userId },
                select: { courseId: true }
            });
            const enrolledCourseIds = enrollments.map(e => e.courseId);
            whereClause = {
                OR: [
                    { courseId: null },
                    { courseId: { in: enrolledCourseIds } }
                ]
            };
        }
        const announcements = await prisma.announcement.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { name: true } }, course: { select: { title: true } } }
        });
        res.json(announcements);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching announcements', error: error.message });
    }
};
export const getAnnouncementsByCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const announcements = await prisma.announcement.findMany({
            where: { courseId },
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { name: true } } }
        });
        res.json(announcements);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching announcements', error: error.message });
    }
};
export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await prisma.announcement.findUnique({ where: { id } });
        if (!announcement)
            return res.status(404).json({ message: 'Announcement not found' });
        if (announcement.authorId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await prisma.announcement.delete({ where: { id } });
        res.json({ message: 'Announcement deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Deletion failed', error: error.message });
    }
};
//# sourceMappingURL=announcementController.js.map