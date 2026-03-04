import { Router } from 'express';
import { register, login, googleAuth, updateProfile, changePassword, forgotPassword } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;
