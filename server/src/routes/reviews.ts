import { Router } from 'express';
import { getProductReviews, createReview, deleteReview } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/products/:slug/reviews', getProductReviews);
router.post('/products/:slug/reviews', authenticate, createReview);
router.delete('/reviews/:id', authenticate, deleteReview);

export default router;
