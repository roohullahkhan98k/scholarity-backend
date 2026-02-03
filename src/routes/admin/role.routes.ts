import { Router } from 'express';
import * as RoleController from '../../controllers/admin/role.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/roles.middleware';

const router = Router();

router.use(authenticate, authorize(['SUPER_ADMIN']));

router.get('/roles', RoleController.listRoles);
router.get('/permissions', RoleController.listPermissions);
router.post('/roles', RoleController.createRole);
router.put('/roles/:id', RoleController.updateRolePermissions);

export default router;
