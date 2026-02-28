import prisma from '../config/prisma.js';
export const createQuiz = async (req, res) => {
    try {
        const { title, courseId, questions, startDate, endDate, timeLimit } = req.body;
        // Verify course ownership
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course)
            return res.status(404).json({ message: 'Course not found' });
        if (course.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const quiz = await prisma.quiz.create({
            data: {
                title,
                courseId,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                timeLimit: timeLimit ? parseInt(timeLimit) : null,
                questions: {
                    create: questions.map((q) => ({
                        text: q.text,
                        options: JSON.stringify(q.options),
                        correctAnswer: String(q.correctAnswer)
                    }))
                }
            },
            include: { questions: true }
        });
        res.status(201).json(quiz);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create quiz', error: error.message });
    }
};
export const getQuizzesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?.id; // Could be undefined if the route is public, but it's protected
        const quizzes = await prisma.quiz.findMany({
            where: { courseId },
            include: {
                _count: { select: { questions: true } },
                attempts: {
                    where: { userId },
                    orderBy: { score: 'desc' },
                    take: 1
                }
            }
        });
        // Format the response to make it easy for the frontend to consume
        const formattedQuizzes = quizzes.map(quiz => ({
            id: quiz.id,
            title: quiz.title,
            courseId: quiz.courseId,
            createdAt: quiz.createdAt,
            _count: quiz._count,
            bestAttempt: quiz.attempts.length > 0 ? quiz.attempts[0] : null
        }));
        res.json(formattedQuizzes);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching quizzes', error: error.message });
    }
};
export const getQuizById = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await prisma.quiz.findUnique({
            where: { id },
            include: { questions: true }
        });
        if (!quiz)
            return res.status(404).json({ message: 'Quiz not found' });
        // Parse options back to JSON for frontend
        const formattedQuiz = {
            ...quiz,
            questions: quiz.questions.map((q) => ({
                ...q,
                options: JSON.parse(q.options)
            }))
        };
        res.json(formattedQuiz);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching quiz', error: error.message });
    }
};
export const getUpcomingQuizzes = async (req, res) => {
    try {
        const userId = req.user.id;
        // Get courses user is enrolled in
        const enrollments = await prisma.enrollment.findMany({
            where: { userId },
            select: { courseId: true }
        });
        const courseIds = enrollments.map(e => e.courseId);
        // Find quizzes for these courses where endDate is in the future
        const now = new Date();
        const upcomingQuizzes = await prisma.quiz.findMany({
            where: {
                courseId: { in: courseIds },
                endDate: { gt: now }
            },
            include: {
                course: { select: { title: true } }
            },
            orderBy: {
                endDate: 'asc'
            }
        });
        res.json(upcomingQuizzes);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching upcoming quizzes', error: error.message });
    }
};
export const submitAttempt = async (req, res) => {
    try {
        const { quizId, answers } = req.body;
        const userId = req.user.id;
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true }
        });
        if (!quiz)
            return res.status(404).json({ message: 'Quiz not found' });
        let score = 0;
        quiz.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) {
                score++;
            }
        });
        const attempt = await prisma.quizAttempt.create({
            data: {
                userId,
                quizId,
                score,
                total: quiz.questions.length
            }
        });
        res.status(201).json({
            message: 'Attempt submitted',
            score,
            total: quiz.questions.length,
            percentage: Math.round((score / quiz.questions.length) * 100)
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Submission failed', error: error.message });
    }
};
//# sourceMappingURL=quizController.js.map