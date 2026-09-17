import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getDashboardStats,
  getOrders,
  updateOrderStatus,
  getUsers,
  updateUserRole,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/adminController';
import { createProductSchema, updateProductSchema, updateOrderStatusSchema, updateUserRoleSchema } from '../validation/schemas';

const router = Router();

router.use(authenticate);
router.use(authorize('admin', 'manager', 'super_admin'));

router.get('/dashboard', getDashboardStats);
router.get('/orders', getOrders);
router.put('/orders/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);
router.get('/users', getUsers);
router.put('/users/:id/role', validate(updateUserRoleSchema), updateUserRole);
router.post('/products', validate(createProductSchema), createProduct);
router.put('/products/:id', validate(updateProductSchema), updateProduct);
router.delete('/products/:id', deleteProduct);

export default router;
