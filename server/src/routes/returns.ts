import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReturnRequest, getMyReturnRequests, verifyReturnOrder } from '../controllers/returnController';
import { createReturnSchema, verifyReturnOrderSchema } from '../validation/schemas';

const router = Router();

router.post('/', validate(createReturnSchema), createReturnRequest);
router.post('/verify-order', validate(verifyReturnOrderSchema), verifyReturnOrder);
router.get('/mine', authenticate, getMyReturnRequests);

export default router;
