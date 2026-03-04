import { Router } from 'express';
import { summarizeNotes, generateQuiz } from '../controllers/aiController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Only authenticated users (students) can use the AI Study Assistant
router.post('/summarize-notes', authenticate, summarizeNotes);
router.post('/generate-quiz', authenticate, generateQuiz);

export default router;
