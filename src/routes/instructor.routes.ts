import { Router } from 'express';
import * as InstructorController from '../controllers/instructor.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/roles.middleware';
import { validateDto } from '../middleware/validate.middleware';
import { ApplyInstructorDto } from '../dtos/instructor/apply-instructor.dto';
import { ReviewApplicationDto } from '../dtos/instructor/review-application.dto';
import { JoinInstructorDto } from '../dtos/instructor/join-instructor.dto';

const router = Router();

// Public: Join as Instructor (Signup + Apply)
router.post('/join', validateDto(JoinInstructorDto), InstructorController.publicJoin);

// Authenticated: Apply for Instructor (For existing students)
router.post('/apply', authenticate, validateDto(ApplyInstructorDto), InstructorController.apply);

// Admin: Manage Applications
router.get('/applications', authenticate, authorize(['admin', 'SUPER_ADMIN']), InstructorController.getApplications);
router.patch('/applications/:id', authenticate, authorize(['admin', 'SUPER_ADMIN']), validateDto(ReviewApplicationDto), InstructorController.reviewApplication);

export default router;
