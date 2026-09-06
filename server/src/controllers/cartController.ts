import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Cart from '../models/Cart';
import Product from '../models/Product';

export async function getCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    let cart = await Cart.findOne({ user: req.userId }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.userId, items: [] });
    }
    res.json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function addToCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId, size, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = await Cart.create({ user: req.userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, size, quantity });
    }

    await cart.save();
    cart = await cart.populate('items.product');

    res.json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateCartItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId, size, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      res.status(404).json({ success: false, error: 'Cart not found' });
      return;
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (!item) {
      res.status(404).json({ success: false, error: 'Item not in cart' });
      return;
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');

    res.json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function removeFromCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId, size } = req.params;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      res.status(404).json({ success: false, error: 'Cart not found' });
      return;
    }

    cart.items = cart.items.filter(
      (item) => !(item.product.toString() === productId && item.size === size)
    );

    await cart.save();
    await cart.populate('items.product');

    res.json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function clearCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    await Cart.findOneAndUpdate({ user: req.userId }, { items: [] });
    res.json({ success: true, data: { items: [] } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
