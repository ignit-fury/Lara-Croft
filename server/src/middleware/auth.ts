import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { env } from '../config/env';
import { findOne, findById } from '../db/supabase-db';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
  body: any;
  params: any;
  query: any;
  headers: any;
  file?: Express.Multer.File;
}

// Lazy-init JWKS client for Supabase ES256 verification
let supabaseJWKS: ReturnType<typeof createRemoteJWKSet> | null = null;
function getSupabaseJWKS() {
  if (!supabaseJWKS) {
    const url = new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
    supabaseJWKS = createRemoteJWKSet(url);
  }
  return supabaseJWKS;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Try admin/customer JWT first (both use ADMIN_JWT_SECRET, HS256)
    try {
      const decoded = jwt.verify(token, env.ADMIN_JWT_SECRET) as { sub: string; type: string };
      console.log('[AUTH] Admin/Customer JWT verified, type:', decoded.type, 'sub:', decoded.sub);
      if (decoded.type === 'admin' || decoded.type === 'customer') {
        const user = await findById('users', decoded.sub);
        if (!user) {
          res.status(401).json({ success: false, error: 'User not found' });
          return;
        }
        req.userId = user.id;
        req.user = user;
        next();
        return;
      }
    } catch {
      // Not an admin/customer JWT, try Supabase JWT
    }

    // Supabase JWT — verify via JWKS (supports ES256)
    try {
      const { payload } = await jwtVerify(token, getSupabaseJWKS(), {
        issuer: `${env.SUPABASE_URL}/auth/v1`,
      });
      const sub = payload.sub;
      console.log('[AUTH] Supabase JWT verified via JWKS, sub:', sub);
      const user = await findOne('users', { supabase_id: sub });
      if (!user) {
        console.error('[AUTH] No user found with supabase_id:', sub);
        res.status(401).json({ success: false, error: 'User not found' });
        return;
      }
      req.userId = user.id;
      req.user = user;
      next();
      return;
    } catch (supabaseError: any) {
      console.error('[AUTH] Supabase JWKS verification failed:', supabaseError.message);
    }

    res.status(401).json({ success: false, error: 'Invalid token' });
  } catch (error: any) {
    console.error('[AUTH] Token verification failed:', error.message, error.name);
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
