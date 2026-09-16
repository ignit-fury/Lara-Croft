import { Router } from 'express';
import { createCheckoutSession, confirmOrder, getOrders, getOrderById, cancelOrder } from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/create-checkout-session', authenticate, createCheckoutSession);
router.post('/confirm', authenticate, confirmOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/:id/cancel', authenticate, cancelOrder);

export default router;
