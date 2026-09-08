import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { findOne, insertOne } from '../db/supabase-db';
import { normalize } from '../db/normalize';

const CUSTOMER_JWT_SECRET = env.ADMIN_JWT_SECRET; // reuse for simplicity

export async function customerSignup(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ success: false, error: 'Email, password, and name required' });
      return;
    }

    const existing = await findOne('users', { email });
    if (existing) {
      res.status(409).json({ success: false, error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await insertOne('users', {
      supabase_id: `customer-${Date.now()}`,
      email,
      name,
      password_hash: passwordHash,
      role: 'user',
      addresses: [],
      preferences: { newsletter: true, notifications: true },
    });

    const token = jwt.sign(
      { sub: user.id, type: 'customer' },
      CUSTOMER_JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: normalize(user),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function customerLogin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password required' });
      return;
    }

    const user = await findOne('users', { email });
    if (!user || !user.password_hash) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    if (user.role !== 'user') {
      res.status(403).json({ success: false, error: 'Use admin login for admin accounts' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { sub: user.id, type: 'customer' },
      CUSTOMER_JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: normalize(user),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
