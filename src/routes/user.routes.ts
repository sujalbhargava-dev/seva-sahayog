import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { upload } from '../middleware/upload';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.patch('/profile', userController.updateProfile);
router.post('/profile-picture', upload.single('image'), userController.uploadProfilePicture);

export default router;
