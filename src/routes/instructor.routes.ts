import { Router } from 'express';
import * as InstructorController from '../controllers/instructor.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/roles.middleware';
import { validateDto } from '../middleware/validate.middleware';
import { ApplyInstructorDto } from '../dtos/instructor/apply-instructor.dto';
import { ReviewApplicationDto } from '../dtos/instructor/review-application.dto';

const router = Router();

router.post('/apply', authenticate, validateDto(ApplyInstructorDto), InstructorController.apply);
router.get('/applications', authenticate, authorize(['admin']), InstructorController.getApplications);
router.patch('/applications/:id', authenticate, authorize(['admin']), validateDto(ReviewApplicationDto), InstructorController.reviewApplication);

export default router;
