import { Router } from 'express';
import { getProducts, getProductBySlug, getFeaturedProducts, getCategories, getRelatedProducts, getSizeGuide } from '../controllers/productController';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/size-guide/:categorySlug', getSizeGuide);
router.get('/:slug/related', getRelatedProducts);
router.get('/:slug', getProductBySlug);

export default router;
