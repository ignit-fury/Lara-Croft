import { Router } from 'express';
import { syncUser, getProfile, updateProfile, addAddress } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/sync', syncUser);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/addresses', authenticate, addAddress);

export default router;
