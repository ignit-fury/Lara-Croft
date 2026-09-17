import { Router } from 'express';
import { createCheckoutSession, confirmOrder, getOrders, getOrderById, cancelOrder } from '../controllers/orderController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCheckoutSessionSchema, confirmOrderSchema } from '../validation/schemas';

const router = Router();

router.post('/create-checkout-session', authenticate, validate(createCheckoutSessionSchema), createCheckoutSession);
router.post('/confirm', authenticate, validate(confirmOrderSchema), confirmOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/:id/cancel', authenticate, cancelOrder);

export default router;
