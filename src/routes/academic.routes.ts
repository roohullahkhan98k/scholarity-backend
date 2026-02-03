import { Router } from 'express';
import * as AcademicController from '../controllers/academic.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/roles.middleware';

const router = Router();

// Public: List Categories (for Filters)
router.get('/categories', AcademicController.listCategories);

// Admin Only
router.post('/categories', authenticate, authorize(['SUPER_ADMIN']), AcademicController.createCategory);
router.put('/categories/:id', authenticate, authorize(['SUPER_ADMIN']), AcademicController.updateCategory);

router.post('/subjects', authenticate, authorize(['SUPER_ADMIN']), AcademicController.createSubject);
router.put('/subjects/:id', authenticate, authorize(['SUPER_ADMIN']), AcademicController.updateSubject);

export default router;
