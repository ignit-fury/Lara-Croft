import { Router } from 'express';
import { getProducts, getProductBySlug, getFeaturedProducts, getCategories, getRelatedProducts } from '../controllers/productController';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:slug/related', getRelatedProducts);
router.get('/:slug', getProductBySlug);

export default router;
