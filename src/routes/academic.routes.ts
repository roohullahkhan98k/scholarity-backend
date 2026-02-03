import { Router } from 'express';
import * as AcademicController from '../controllers/academic.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/roles.middleware';

const router = Router();

// Public: Listing (for Filters/Search)
router.get('/categories', AcademicController.listCategories);
router.get('/subjects', AcademicController.listSubjects);

// Category/Subject Requests (Teacher)
router.post('/requests', authenticate, authorize(['teacher', 'SUPER_ADMIN']), AcademicController.requestAcademicItem);

// Admin Only - Resolve Requests
router.get('/requests', authenticate, authorize(['SUPER_ADMIN']), AcademicController.listAcademicRequests);
router.patch('/requests/:id', authenticate, authorize(['SUPER_ADMIN']), AcademicController.resolveAcademicRequest);

// Admin Only - Direct Management
router.post('/categories', authenticate, authorize(['SUPER_ADMIN']), AcademicController.createCategory);
router.put('/categories/:id', authenticate, authorize(['SUPER_ADMIN']), AcademicController.updateCategory);
router.delete('/categories/:id', authenticate, authorize(['SUPER_ADMIN']), AcademicController.deleteCategory);
router.post('/categories/bulk-delete', authenticate, authorize(['SUPER_ADMIN']), AcademicController.bulkDeleteCategories);

router.post('/subjects', authenticate, authorize(['SUPER_ADMIN']), AcademicController.createSubject);
router.put('/subjects/:id', authenticate, authorize(['SUPER_ADMIN']), AcademicController.updateSubject);
router.delete('/subjects/:id', authenticate, authorize(['SUPER_ADMIN']), AcademicController.deleteSubject);
router.post('/subjects/bulk-delete', authenticate, authorize(['SUPER_ADMIN']), AcademicController.bulkDeleteSubjects);

export default router;
