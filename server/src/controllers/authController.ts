import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';

export async function syncUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { supabaseId, email, name, avatar } = req.body;

    if (!supabaseId || !email || !name) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    let user = await User.findOne({ supabaseId });
    
    if (!user) {
      user = await User.create({
        supabaseId,
        email,
        name,
        avatar,
        role: 'user',
        addresses: [],
        preferences: { newsletter: true, notifications: true },
      });
    } else {
      user.name = name;
      user.avatar = avatar;
      await user.save();
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, avatar, preferences } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function addAddress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { label, line1, line2, city, state, postalCode, country, phone } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    user.addresses.push({ label, line1, line2, city, state, postalCode, country: country || 'IN', phone });
    await user.save();
    
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
