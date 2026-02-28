import { Router } from 'express';
import { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse } from '../controllers/courseController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
const router = Router();
// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
// Protected routes
router.post('/', authenticate, authorize(['TEACHER', 'ADMIN']), createCourse);
router.put('/:id', authenticate, authorize(['TEACHER', 'ADMIN']), updateCourse);
router.delete('/:id', authenticate, authorize(['TEACHER', 'ADMIN']), deleteCourse);
export default router;
//# sourceMappingURL=courseRoutes.js.map