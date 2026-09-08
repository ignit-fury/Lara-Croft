import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { findOne, insertOne, updateOne } from '../db/supabase-db';
import { normalize } from '../db/normalize';

export async function syncUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { supabaseId, email, name, avatar } = req.body;
    console.log('[SYNC] Called with:', { supabaseId, email, name });

    if (!supabaseId || !email || !name) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    // Try finding by supabase_id first
    let user = await findOne('users', { supabase_id: supabaseId });

    if (!user) {
      // Try finding by email (user may have signed up via email/password first)
      user = await findOne('users', { email });
      if (user) {
        // Link existing email account to this Supabase ID
        user = await updateOne('users', user.id, { supabase_id: supabaseId, name, avatar });
        console.log('[SYNC] Linked existing email user to supabase_id:', user?.id);
      } else {
        user = await insertOne('users', {
          supabase_id: supabaseId,
          email,
          name,
          avatar,
          role: 'user',
          addresses: [],
          preferences: { newsletter: true, notifications: true },
        });
        console.log('[SYNC] Created new user:', user?.id);
      }
    } else {
      user = await updateOne('users', user.id, { name, avatar });
      console.log('[SYNC] Updated user:', user?.id);
    }

    res.json({ success: true, data: normalize(user) });
  } catch (error: any) {
    console.error('[SYNC] Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    res.json({ success: true, data: normalize(req.user) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, avatar, preferences } = req.body;
    const updates: Record<string, any> = {};

    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;
    if (preferences) {
      updates.preferences = { ...req.user.preferences, ...preferences };
    }

    const user = await updateOne('users', req.userId!, updates);
    res.json({ success: true, data: normalize(user) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function addAddress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { label, line1, line2, city, state, postalCode, country, phone } = req.body;
    const addresses = [...(req.user.addresses || []), {
      label,
      line1,
      line2,
      city,
      state,
      postalCode,
      country: country || 'IN',
      phone,
    }];

    const user = await updateOne('users', req.userId!, { addresses });
    res.json({ success: true, data: normalize(user) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
