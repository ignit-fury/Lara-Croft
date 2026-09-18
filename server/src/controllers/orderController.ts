import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import { supabase, findOne, findMany, insertOne, updateOne } from '../db/supabase-db';
import { razorpay } from '../config/razorpay';
import { normalize } from '../db/normalize';
import { env } from '../config/env';

export async function createCheckoutSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { shippingAddress } = req.body;

    // Only block on genuinely in-flight pending orders (created within the last 30 min).
    // Stale abandoned orders from days ago must not lock the user out permanently.
    const staleCutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const existingOrders = await findMany('orders', { user_id: req.userId! });
    const inFlight = existingOrders.filter(
      (o: any) =>
        o.payment_status === 'pending' &&
        o.status === 'pending' &&
        (o.created_at || o.createdAt) > staleCutoff,
    );
    if (inFlight.length > 0) {
      res.status(400).json({ success: false, error: 'Payment already in progress. Please complete or cancel the existing order.' });
      return;
    }

    const cart = await findOne('cart', { user_id: req.userId! });
    if (!cart || !cart.items || cart.items.length === 0) {
      res.status(400).json({ success: false, error: 'Cart is empty' });
      return;
    }

    const productIds = cart.items.map((item: any) => item.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, images, stock')
      .in('id', productIds);

    const productMap = new Map((products || []).map((p: any) => [p.id, p]));

    // Check stock before creating order
    for (const item of cart.items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        throw new Error(`Product ${item.product_id} not found in catalog (deleted or invalid)`);
      }
      if (product.stock != null && product.stock > 0 && item.quantity > product.stock) {
        res.status(400).json({
          success: false,
          error: `"${product.name}" has only ${product.stock} left in stock. Please update your cart.`,
        });
        return;
      }
    }

    const items = cart.items.map((item: any) => {
      const product = productMap.get(item.product_id);
      if (!product) {
        throw new Error(`Product ${item.product_id} not found in catalog (deleted or invalid)`);
      }
      return {
        product_id: item.product_id,
        name: product.name,
        price: product.price,
        size: item.size,
        quantity: item.quantity,
        image: product.images?.[0] || '',
      };
    });

    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 500000 ? 0 : 49900;
    const tax = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + shipping + tax;

    const receiptId = `rcpt_${req.userId!}_${Date.now()}`;
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: receiptId,
    });
    console.log('[ORDER] Razorpay order created:', razorpayOrder.id, 'amount:', totalAmount, 'receipt:', receiptId);

    const order = await insertOne('orders', {
      user_id: req.userId,
      items,
      subtotal,
      shipping,
      tax,
      total: totalAmount,
      currency: 'INR',
      status: 'pending',
      payment_status: 'pending',
      razorpay_order_id: razorpayOrder.id,
      shipping_address: shippingAddress,
    });

    res.json({ success: true, data: { orderId: razorpayOrder.id, amount: totalAmount, dbOrderId: order.id } });
  } catch (error: any) {
    console.error('[ORDER] createCheckoutSession error:', error.message, error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function confirmOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    console.log('[ORDER] Confirm called:', { razorpay_order_id, razorpay_payment_id, razorpay_signature });

    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    console.log('[ORDER] Expected sig:', expectedSignature);
    console.log('[ORDER] Received sig:', razorpay_signature);
    console.log('[ORDER] Match:', expectedSignature === razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ success: false, error: 'Invalid payment signature' });
      return;
    }

    const order = await findOne('orders', { razorpay_order_id: razorpay_order_id });
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // IDOR guard: the order must belong to the requesting user
    if (order.user_id !== req.userId!) {
      res.status(403).json({ success: false, error: 'Not your order' });
      return;
    }

    if (order.payment_status === 'paid') {
      res.json({ success: true, data: normalize(order) });
      return;
    }

    const updatedOrder = await updateOne('orders', order.id, {
      payment_status: 'paid',
      status: 'confirmed',
      razorpay_payment_id: razorpay_payment_id,
    });

    const user = await findOne('users', { id: req.userId! });
    if (user) {
      const { sendOrderConfirmation } = await import('../services/emailService');
      sendOrderConfirmation({
        to: user.email,
        customerName: user.name,
        orderId: order.id,
        items: order.items.map((i: any) => ({ name: i.name, size: i.size, quantity: i.quantity, price: i.price })),
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        shippingAddress: order.shipping_address,
      });
    }

    const cart = await findOne('cart', { user_id: req.userId! });
    if (cart && cart.items && cart.items.length > 0) {
      await updateOne('cart', cart.id, { items: [] });
    }

    res.json({ success: true, data: normalize(updatedOrder) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const { data, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      success: true,
      data: normalize(data) || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        pages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getOrderById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id as string)
      .eq('user_id', req.userId!)
      .single();

    if (error || !data) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
    res.json({ success: true, data: normalize(data) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function cancelOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const order = await findOne('orders', { id });
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
    if (order.user_id !== req.userId!) {
      res.status(403).json({ success: false, error: 'Not your order' });
      return;
    }
    if (order.payment_status !== 'pending') {
      res.status(400).json({ success: false, error: 'Only pending orders can be cancelled' });
      return;
    }
    const updated = await updateOne('orders', id, {
      status: 'cancelled',
      payment_status: 'failed',
    });
    res.json({ success: true, data: normalize(updated) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
