import { Router } from 'express';
import * as policyController from '../controllers/policy.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '../utils/constants';

const router = Router();

router.use(authenticate);

router.get('/', authorize(Role.WORKER, Role.ADMIN), policyController.getPolicies);
router.post('/', authorize(Role.ADMIN), policyController.createPolicy);
router.get('/:id', authorize(Role.WORKER, Role.ADMIN), policyController.getPolicyById);
router.post('/:id/vote', authorize(Role.WORKER), policyController.castVote);
router.patch('/:id/close', authorize(Role.ADMIN), policyController.closePolicy);

export default router;
