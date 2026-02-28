import { Router } from 'express';
import { enrollInCourse, getMyEnrolledCourses, getCourseStudents, manuallyAddStudent, getMyPerformance } from '../controllers/enrollmentController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
const router = Router();
router.post('/', authenticate, enrollInCourse);
router.get('/my-courses', authenticate, getMyEnrolledCourses);
router.get('/my-performance', authenticate, getMyPerformance);
// Teacher/Admin student management routes
router.get('/course/:courseId/students', authenticate, authorize(['TEACHER', 'ADMIN']), getCourseStudents);
router.post('/course/:courseId/add-student', authenticate, authorize(['TEACHER', 'ADMIN']), manuallyAddStudent);
export default router;
//# sourceMappingURL=enrollmentRoutes.js.map