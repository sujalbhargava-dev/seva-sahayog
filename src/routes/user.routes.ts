import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.patch('/profile', userController.updateProfile);

export default router;
