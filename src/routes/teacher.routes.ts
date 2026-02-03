import { Router } from 'express';
import * as TeacherController from '../controllers/teacher.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/roles.middleware';

const router = Router();

// Apply auth to all routes
router.use(authenticate);

// Profile Management (Accessible to anyone who wants to become a teacher or is one)
// But typically 'TEACHER' role or 'student' applying. 
// Let's assume any authenticated user can effectively start "becoming" a teacher by editing this profile 
// OR we restrict this to roles that are TEACHER or in 'Review' process.
// For now, let's open it to authenticated users to support the application flow.

router.get('/profile', TeacherController.getProfile);
router.put('/profile', TeacherController.updateProfile);

export default router;
