import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReturnRequest, getMyReturnRequests } from '../controllers/returnController';
import { createReturnSchema } from '../validation/schemas';

const router = Router();

router.post('/', validate(createReturnSchema), createReturnRequest);
router.get('/mine', authenticate, getMyReturnRequests);

export default router;
