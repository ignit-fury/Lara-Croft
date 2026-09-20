import { Router } from 'express';
import { createGuestCheckoutSession, confirmGuestOrder } from '../controllers/guestOrderController';
import { getGuestCart, addToGuestCart, updateGuestCart, removeFromGuestCart } from '../controllers/guestCartController';

const router = Router();

router.post('/orders/guest-checkout', createGuestCheckoutSession);
router.post('/orders/guest-confirm', confirmGuestOrder);
router.get('/cart/guest/:sessionId', getGuestCart);
router.post('/cart/guest/:sessionId', addToGuestCart);
router.put('/cart/guest/:sessionId', updateGuestCart);
router.delete('/cart/guest/:sessionId', removeFromGuestCart);

export default router;
