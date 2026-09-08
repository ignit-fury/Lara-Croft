import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabase, findOne, insertOne, updateOne } from '../db/supabase-db';
import { normalize } from '../db/normalize';

async function getOrCreateCart(userId: string) {
  let cart = await findOne('cart', { user_id: userId });
  if (!cart) {
    cart = await insertOne('cart', { user_id: userId, items: [] });
  }
  return cart;
}

async function getCartWithProducts(cart: any) {
  if (!cart.items || cart.items.length === 0) return { ...cart, items: [] };

  const productIds = cart.items.map((item: any) => item.product_id);
  const { data: products } = await supabase
    .from('products')
    .select('*, categories!inner(id, name, slug)')
    .in('id', productIds);

  const productMap = new Map((products || []).map((p: any) => [p.id, p]));

  const items = cart.items.map((item: any) => ({
    ...item,
    product: productMap.get(item.product_id) || null,
  })).filter((item: any) => item.product);

  return { ...cart, items };
}

export async function getCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    let cart = await getOrCreateCart(req.userId!);
    cart = await getCartWithProducts(cart);
    res.json({ success: true, data: normalize(cart) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function addToCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId, size, quantity = 1 } = req.body;

    const product = await findOne('products', { id: productId });
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    const cart = await getOrCreateCart(req.userId!);
    const items = [...(cart.items || [])];

    const existingIndex = items.findIndex(
      (item: any) => item.product_id === productId && item.size === size
    );

    if (existingIndex >= 0) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({ product_id: productId, size, quantity });
    }

    const updated = await updateOne('cart', cart.id, { items });
    const result = await getCartWithProducts(updated);

    res.json({ success: true, data: normalize(result) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateCartItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId, size, quantity } = req.body;

    const cart = await findOne('cart', { user_id: req.userId! });
    if (!cart) {
      res.status(404).json({ success: false, error: 'Cart not found' });
      return;
    }

    const items = [...(cart.items || [])];
    const idx = items.findIndex(
      (item: any) => item.product_id === productId && item.size === size
    );

    if (idx < 0) {
      res.status(404).json({ success: false, error: 'Item not in cart' });
      return;
    }

    items[idx].quantity = quantity;
    const updated = await updateOne('cart', cart.id, { items });
    const result = await getCartWithProducts(updated);

    res.json({ success: true, data: normalize(result) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function removeFromCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    const productId = req.query.productId as string;
    const size = req.query.size as string;

    const cart = await findOne('cart', { user_id: req.userId! });
    if (!cart) {
      res.status(404).json({ success: false, error: 'Cart not found' });
      return;
    }

    const items = (cart.items || []).filter(
      (item: any) => !(item.product_id === productId && item.size === size)
    );

    const updated = await updateOne('cart', cart.id, { items });
    const result = await getCartWithProducts(updated);

    res.json({ success: true, data: normalize(result) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function clearCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    const cart = await findOne('cart', { user_id: req.userId! });
    if (cart) {
      await updateOne('cart', cart.id, { items: [] });
    }
    res.json({ success: true, data: { items: [] } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
