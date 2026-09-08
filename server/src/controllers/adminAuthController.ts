import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { findOne } from '../db/supabase-db';

export async function adminLogin(req: Request, res: Response): Promise<void> {
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

    if (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'super_admin') {
      res.status(403).json({ success: false, error: 'Not authorized for admin access' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { sub: user.id, type: 'admin' },
      env.ADMIN_JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user.id,
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
