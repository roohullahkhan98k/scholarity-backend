import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validate.middleware';
import { SignupDto } from '../dtos/auth/signup.dto';
import { LoginDto } from '../dtos/auth/login.dto';

const router = Router();

router.post('/signup', validateDto(SignupDto), AuthController.signup);
router.post('/login', validateDto(LoginDto), AuthController.login);
router.get('/me', authenticate, AuthController.getProfile);
router.post('/logout', authenticate, AuthController.logout);

export default router;
