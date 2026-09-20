import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, isInWishlist } from '../controllers/wishlistController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getWishlist);
router.post('/:productId', authenticate, addToWishlist);
router.delete('/:productId', authenticate, removeFromWishlist);
router.get('/check/:productId', authenticate, isInWishlist);

export default router;
