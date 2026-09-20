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
import { supabase } from '../db/supabase-db';

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

router.put('/categories/:id/size-guide', async (req, res) => {
  try {
    const { id } = req.params;
    const { sizeGuide } = req.body;
    const { error } = await supabase
      .from('categories')
      .update({ size_guide: sizeGuide })
      .eq('id', id);
    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
