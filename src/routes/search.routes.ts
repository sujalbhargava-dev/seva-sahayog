import { Router } from 'express';
import * as searchController from '../controllers/search.controller';
import { validate } from '../middleware/validate';
import { searchWorkersSchema } from '../validators/search.validator';

const router = Router();

router.get(
  '/workers',
  validate(searchWorkersSchema, 'query'),
  searchController.searchWorkers
);

export default router;
