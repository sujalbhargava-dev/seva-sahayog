import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Routes for AI-powered features
// Using authentication middleware to ensure only logged-in users access these APIs

router.get('/insights', authenticate, aiController.getDemandInsights);
router.get('/match', authenticate, aiController.getSmartMatches);

export default router;
