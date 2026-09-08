import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import { supabase, findOne, insertOne, updateOne } from '../db/supabase-db';
import { razorpay } from '../config/razorpay';
import { normalize } from '../db/normalize';
import { env } from '../config/env';

export async function createCheckoutSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { shippingAddress } = req.body;

    const cart = await findOne('cart', { user_id: req.userId! });
    if (!cart || !cart.items || cart.items.length === 0) {
      res.status(400).json({ success: false, error: 'Cart is empty' });
      return;
    }

    const productIds = cart.items.map((item: any) => item.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, images')
      .in('id', productIds);

    const productMap = new Map((products || []).map((p: any) => [p.id, p]));

    const items = cart.items.map((item: any) => {
      const product = productMap.get(item.product_id);
      return {
        product_id: item.product_id,
        name: product?.name || 'Unknown',
        price: product?.price || 0,
        size: item.size,
        quantity: item.quantity,
        image: product?.images?.[0] || '',
      };
    });

    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 500000 ? 0 : 49900;
    const tax = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + shipping + tax;

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });
    console.log('[ORDER] Razorpay order created:', razorpayOrder.id, 'amount:', totalAmount);

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
    if (cart) {
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
