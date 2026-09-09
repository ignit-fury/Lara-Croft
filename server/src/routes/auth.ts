import { Router } from 'express';
import { syncUser, getProfile, updateProfile, addAddress, getAddresses, deleteAddress } from '../controllers/authController';
import { adminLogin } from '../controllers/adminAuthController';
import { customerSignup, customerLogin } from '../controllers/customerAuthController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/sync', syncUser);
router.post('/admin-login', adminLogin);
router.post('/signup', customerSignup);
router.post('/login', customerLogin);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/addresses', authenticate, getAddresses);
router.post('/addresses', authenticate, addAddress);
router.delete('/addresses/:index', authenticate, deleteAddress);

export default router;
