import { Router } from 'express';
import { createAnnouncement, getAnnouncements, getAnnouncementsByCourse, deleteAnnouncement } from '../controllers/announcementController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
const router = Router();
router.post('/', authenticate, authorize(['ADMIN', 'TEACHER']), createAnnouncement);
router.get('/', authenticate, getAnnouncements);
router.get('/course/:courseId', authenticate, getAnnouncementsByCourse);
router.delete('/:id', authenticate, authorize(['ADMIN', 'TEACHER']), deleteAnnouncement);
export default router;
//# sourceMappingURL=announcementRoutes.js.map