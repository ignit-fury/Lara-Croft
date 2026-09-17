import { Router } from 'express';
import { syncUser, getProfile, updateProfile, addAddress, getAddresses, deleteAddress } from '../controllers/authController';
import { adminLogin } from '../controllers/adminAuthController';
import { customerSignup, customerLogin } from '../controllers/customerAuthController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { syncUserSchema, adminLoginSchema, customerSignupSchema, customerLoginSchema, updateProfileSchema, addressSchema, normalizeAddress } from '../validation/schemas';

const router = Router();

router.post('/sync', validate(syncUserSchema), syncUser);
router.post('/admin-login', validate(adminLoginSchema), adminLogin);
router.post('/signup', validate(customerSignupSchema), customerSignup);
router.post('/login', validate(customerLoginSchema), customerLogin);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.get('/addresses', authenticate, getAddresses);
router.post('/addresses', authenticate, validate(addressSchema, { normalize: normalizeAddress, stage: 'address' }), addAddress);
router.delete('/addresses/:index', authenticate, deleteAddress);

export default router;
