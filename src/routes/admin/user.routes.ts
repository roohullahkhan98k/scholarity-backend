import { Router } from 'express';
import * as AdminUserController from '../../controllers/admin/user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/roles.middleware';

const router = Router();

// Apply auth and admin check to all routes
router.use(authenticate, authorize(['SUPER_ADMIN']));

router.get('/users', AdminUserController.listUsers);
router.patch('/users/:id/status', AdminUserController.updateUserStatus);
router.patch('/users/:id/role', AdminUserController.changeUserRole);
router.patch('/teacher/:id/approve', AdminUserController.approveTeacher);

export default router;
