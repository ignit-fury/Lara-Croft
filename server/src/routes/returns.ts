import { Router, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { AuthRequest } from '../middleware/auth';
import { env } from '../config/env';
import { findById } from '../db/supabase-db';
import { validate } from '../middleware/validate';
import { createReturnRequest, verifyReturnOrder } from '../controllers/returnController';
import { createReturnSchema, verifyReturnOrderSchema } from '../validation/schemas';

const router = Router();

/** Attach req.userId when a valid customer JWT is present; never rejects (guests allowed). */
async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const decoded = jwt.verify(header.split(' ')[1], env.ADMIN_JWT_SECRET) as { sub: string; type: string };
      if (decoded.type === 'customer') {
        const user = await findById('users', decoded.sub);
        if (user) {
          req.userId = user.id;
          req.user = user;
        }
      }
    }
  } catch { /* guest — continue without userId */ }
  next();
}

// Spam brake for the public endpoints (guests included)
const returnsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', returnsLimiter, optionalAuth, validate(createReturnSchema), createReturnRequest);
router.post('/verify-order', returnsLimiter, optionalAuth, validate(verifyReturnOrderSchema), verifyReturnOrder);

export default router;
