import { Router } from 'express';
import * as TeachersController from '../controllers/teachers.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/roles.middleware';
import { validateDto } from '../middleware/validate.middleware';
import { CreateTeacherDto } from '../dtos/teachers/create-teacher.dto';
import { UpdateTeacherDto } from '../dtos/teachers/update-teacher.dto';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['admin', 'SUPER_ADMIN']), validateDto(CreateTeacherDto), TeachersController.create);
router.get('/', TeachersController.findAll);
router.get('/:id', TeachersController.findOne);
router.patch('/:id', authorize(['admin', 'SUPER_ADMIN']), validateDto(UpdateTeacherDto), TeachersController.update);
router.delete('/:id', authorize(['admin', 'SUPER_ADMIN']), TeachersController.remove);

export default router;
