import { Router } from 'express';
import * as disputeController from '../controllers/dispute.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { Role } from '../utils/constants';
import {
  raiseDisputeSchema,
  resolveDisputeSchema,
} from '../validators/dispute.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(Role.CUSTOMER, Role.WORKER),
  validate(raiseDisputeSchema),
  disputeController.raiseDispute
);

router.get('/', disputeController.getDisputes);

router.patch(
  '/:id/resolve',
  authorize(Role.ADMIN),
  validate(resolveDisputeSchema),
  disputeController.resolveDispute
);

export default router;
