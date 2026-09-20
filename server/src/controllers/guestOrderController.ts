import { Request, Response } from 'express';
import crypto from 'crypto';
import { supabase, findOne, findMany, insertOne, updateOne } from '../db/supabase-db';
import { razorpay } from '../config/razorpay';
import { normalize } from '../db/normalize';
import { env } from '../config/env';
import { clearGuestCart } from './guestCartController';

export async function createGuestCheckoutSession(req: Request, res: Response): Promise<void> {
  try {
    const { email, name, phone, shippingAddress, items: cartItems, guestSessionId } = req.body;

    if (!email || !name || !phone || !shippingAddress || !cartItems || cartItems.length === 0 || !guestSessionId) {
      res.status(400).json({ success: false, error: 'Missing required fields: email, name, phone, shippingAddress, items, guestSessionId' });
      return;
    }

    const staleCutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const existingOrders = await findMany('orders', {
      guest_session_id: guestSessionId,
    });
    const inFlight = existingOrders.filter(
      (o: any) =>
        o.payment_status === 'pending' &&
        o.status === 'pending' &&
        (o.created_at || o.createdAt) > staleCutoff,
    );
    if (inFlight.length > 0) {
      res.status(400).json({ success: false, error: 'Payment already in progress.' });
      return;
    }

    const productIds = cartItems.map((item: any) => item.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, images, stock')
      .in('id', productIds);

    const productMap = new Map((products || []).map((p: any) => [p.id, p]));

    for (const item of cartItems) {
      const product = productMap.get(item.product_id);
      if (!product) {
        res.status(400).json({ success: false, error: `Product ${item.product_id} not found` });
        return;
      }
      if (product.stock != null && product.stock > 0 && item.quantity > product.stock) {
        res.status(400).json({
          success: false,
          error: `"${product.name}" has only ${product.stock} left in stock. Please update your cart.`,
        });
        return;
      }
    }

    const items = cartItems.map((item: any) => {
      const product = productMap.get(item.product_id)!;
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

    const receiptId = `rcpt_guest_${Date.now()}`;
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: receiptId,
    });

    const order = await insertOne('orders', {
      user_id: null,
      guest_email: email,
      guest_name: name,
      guest_session_id: guestSessionId,
      items,
      subtotal,
      shipping,
      tax,
      total: totalAmount,
      currency: 'INR',
      status: 'pending',
      payment_status: 'pending',
      razorpay_order_id: razorpayOrder.id,
      shipping_address: { ...shippingAddress, phone },
    });

    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: totalAmount,
        guestSessionId,
        dbOrderId: order.id,
      },
    });
  } catch (error: any) {
    console.error('[ORDER] createGuestCheckoutSession error:', error.message, error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function confirmGuestOrder(req: Request, res: Response): Promise<void> {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, guestSessionId } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const sigBuf = Buffer.from(razorpay_signature || '', 'utf8');
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      res.status(400).json({ success: false, error: 'Invalid payment signature' });
      return;
    }

    const order = await findOne('orders', { razorpay_order_id });
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    if (order.user_id !== null || order.guest_session_id !== guestSessionId) {
      res.status(403).json({ success: false, error: 'Order does not match guest session' });
      return;
    }

    if (order.payment_status === 'paid') {
      res.json({ success: true, data: normalize(order) });
      return;
    }

    const stockUpdates: Promise<any>[] = [];
    for (const item of order.items) {
      const product = await findOne('products', { id: item.product_id });
      if (!product) continue;

      const newStock = Math.max(0, (product.stock || 0) - item.quantity);
      const updates: Record<string, any> = { stock: newStock };

      if (item.size && product.stock_by_size && typeof product.stock_by_size === 'object') {
        const currentSizeStock = product.stock_by_size[item.size] ?? 0;
        const newSizeStock = Math.max(0, currentSizeStock - item.quantity);
        updates.stock_by_size = { ...product.stock_by_size, [item.size]: newSizeStock };
      }

      stockUpdates.push(updateOne('products', product.id, updates));
    }
    await Promise.all(stockUpdates);

    const updatedOrder = await updateOne('orders', order.id, {
      payment_status: 'paid',
      status: 'confirmed',
      razorpay_payment_id,
    });

    const guestEmail = order.guest_email;
    const guestName = order.guest_name;
    if (guestEmail) {
      const { sendOrderConfirmation } = await import('../services/emailService');
      sendOrderConfirmation({
        to: guestEmail,
        customerName: guestName || 'Guest',
        orderId: order.id,
        items: order.items.map((i: any) => ({ name: i.name, size: i.size, quantity: i.quantity, price: i.price })),
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        shippingAddress: order.shipping_address,
      });
    }

    if (guestSessionId) clearGuestCart(guestSessionId);

    res.json({ success: true, data: normalize(updatedOrder) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
