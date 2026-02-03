import { Router } from 'express';
import * as AdminCourseController from '../../controllers/admin/course.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/roles.middleware';

const router = Router();

router.use(authenticate, authorize(['SUPER_ADMIN']));

router.get('/pending', AdminCourseController.listPendingCourses);
router.get('/:id/logs', AdminCourseController.getCourseLogs);
router.post('/:id/approve', AdminCourseController.approveCourse);
router.post('/:id/reject', AdminCourseController.rejectCourse);

export default router;
