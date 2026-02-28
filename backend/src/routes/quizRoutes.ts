import { Router } from 'express';
import { createQuiz, getQuizzesByCourse, getQuizById, submitAttempt, getUpcomingQuizzes } from '../controllers/quizController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/upcoming', authenticate, authorize(['STUDENT']), getUpcomingQuizzes);
router.get('/course/:courseId', authenticate, getQuizzesByCourse);
router.get('/:id', authenticate, getQuizById);
router.post('/', authenticate, authorize(['TEACHER', 'ADMIN']), createQuiz);
router.post('/submit', authenticate, authorize(['STUDENT']), submitAttempt);

export default router;
