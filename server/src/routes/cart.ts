import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { addToCartSchema, updateCartItemSchema, removeFromCartSchema } from '../validation/schemas';

const router = Router();

router.get('/', authenticate, getCart);
router.post('/add', authenticate, validate(addToCartSchema), addToCart);
router.put('/update', authenticate, validate(updateCartItemSchema), updateCartItem);
router.delete('/remove', authenticate, validate(removeFromCartSchema, { source: 'query', stage: 'cart-remove-query' }), removeFromCart);
router.delete('/clear', authenticate, clearCart);

export default router;
