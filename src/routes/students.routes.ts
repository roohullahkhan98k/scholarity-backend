import { Router } from 'express';
import * as StudentsController from '../controllers/students.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/roles.middleware';
import { validateDto } from '../middleware/validate.middleware';
import { CreateStudentDto } from '../dtos/students/create-student.dto';
import { UpdateStudentDto } from '../dtos/students/update-student.dto';

const router = Router();

router.use(authenticate); // All student routes protected? Original controller had @UseGuards(JwtAuthGuard) at class level.

router.post('/', authorize(['admin']), validateDto(CreateStudentDto), StudentsController.create);
router.get('/', StudentsController.findAll); // Original didn't have @Roles('admin') for findAll? 
// Original code:
// @Get() findAll() { return ...} -> Public by class guard logic? No, class guard is JwtAuthGuard. So authenticated.
// Only create, update, remove were Admin.

router.get('/:id', StudentsController.findOne);
router.patch('/:id', authorize(['admin']), validateDto(UpdateStudentDto), StudentsController.update);
router.delete('/:id', authorize(['admin']), StudentsController.remove);

export default router;
