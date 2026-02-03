import { Router } from 'express';
import * as CourseController from '../controllers/course.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/roles.middleware';

const router = Router();

router.use(authenticate);

// Public Course Search & Listing
router.get('/', CourseController.listCourses);

// List My Courses
router.get('/my', CourseController.getMyCourses);
router.get('/my-courses', CourseController.getMyCourses);

// Get Course Details (Editor View)
router.get('/:id', CourseController.getCourseDetails);

// Create Draft
router.post('/', authorize(['teacher', 'SUPER_ADMIN']), CourseController.createCourse);

// Update Draft (Resume/Edit)
router.put('/:id', authorize(['teacher', 'SUPER_ADMIN']), CourseController.updateCourse);

// Add Content
router.post('/:courseId/units', authorize(['teacher', 'SUPER_ADMIN']), CourseController.addUnit);
router.post('/:unitId/lessons', authorize(['teacher', 'SUPER_ADMIN']), CourseController.addLesson);

// Submission
// Submission
router.post('/:id/submit', authorize(['teacher', 'SUPER_ADMIN']), CourseController.submitForReview);

// Delete Course
router.delete('/:id', authorize(['teacher', 'SUPER_ADMIN']), CourseController.deleteCourse);

// Toggle Status (Activate/Deactivate)
router.patch('/:id/status', authorize(['teacher', 'SUPER_ADMIN']), CourseController.toggleCourseStatus);

export default router;
