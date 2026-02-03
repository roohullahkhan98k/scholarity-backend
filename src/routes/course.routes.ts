import { Router } from 'express';
import * as CourseController from '../controllers/course.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/roles.middleware';

const router = Router();

router.use(authenticate);

// Public Course Search & Listing
router.get('/', CourseController.listCourses);

// List My Courses
router.get('/my-courses', CourseController.getMyCourses);

// Get Course Details (Editor View)
router.get('/:id', CourseController.getCourseDetails);

// Create Draft
router.post('/', authorize(['TEACHER', 'SUPER_ADMIN']), CourseController.createCourse);

// Add Content
router.post('/:courseId/units', authorize(['TEACHER', 'SUPER_ADMIN']), CourseController.addUnit);
router.post('/:unitId/lessons', authorize(['TEACHER', 'SUPER_ADMIN']), CourseController.addLesson);

// Submission
router.post('/:id/submit', authorize(['TEACHER', 'SUPER_ADMIN']), CourseController.submitForReview);

export default router;
