import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabase, findOne, updateOne } from '../db/supabase-db';
import { normalize } from '../db/normalize';

async function getWishlistIds(userId: string): Promise<string[]> {
  const user = await findOne('users', { id: userId });
  if (!user) return [];
  const wishlist = (user as any).wishlist;
  if (!Array.isArray(wishlist)) return [];
  return wishlist;
}

export async function getWishlist(req: AuthRequest, res: Response): Promise<void> {
  try {
    const ids = await getWishlistIds(req.userId!);
    if (ids.length === 0) {
      res.json({ success: true, data: [] });
      return;
    }

    const { data: products } = await supabase
      .from('products')
      .select('*, categories!inner(id, name, slug)')
      .in('id', ids);

    res.json({ success: true, data: normalize(products || []) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function addToWishlist(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const ids = await getWishlistIds(req.userId!);

    if (ids.includes(productId)) {
      res.json({ success: true, data: ids });
      return;
    }

    ids.push(productId);
    await updateOne('users', req.userId!, { wishlist: ids });
    res.json({ success: true, data: ids });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function removeFromWishlist(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const ids = await getWishlistIds(req.userId!);
    const filtered = ids.filter((id) => id !== productId);

    await updateOne('users', req.userId!, { wishlist: filtered });
    res.json({ success: true, data: filtered });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function isInWishlist(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const ids = await getWishlistIds(req.userId!);
    res.json({ success: true, data: { inWishlist: ids.includes(productId) } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
