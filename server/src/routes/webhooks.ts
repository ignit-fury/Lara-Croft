import { Router, Request, Response } from 'express';
import express from 'express';
import { env } from '../config/env';
import { findOne, updateOne } from '../db/supabase-db';
import crypto from 'crypto';
import { sendOrderConfirmation } from '../services/emailService';

const router = Router();

router.post('/razorpay', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['x-razorpay-signature'];
  if (!sig) {
    res.status(400).json({ success: false, error: 'Missing signature' });
    return;
  }

  let event: any;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body.toString())
      .digest('hex');

    if (expectedSignature !== sig) {
      res.status(400).json({ success: false, error: 'Invalid signature' });
      return;
    }

    event = JSON.parse(req.body.toString());
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).json({ success: false, error: 'Invalid signature' });
    return;
  }

  try {
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        const order = await findOne('orders', { razorpay_order_id: payment.order_id });
        if (order) {
          await updateOne('orders', order.id, {
            payment_status: 'paid',
            status: 'confirmed',
            razorpay_payment_id: payment.id,
          });
          const user = await findOne('users', { id: order.user_id });
          if (user) {
            await sendOrderConfirmation({
              to: user.email,
              customerName: user.name || 'Customer',
              orderId: order.id,
              items: order.items.map((i: any) => ({ name: i.name, size: i.size, quantity: i.quantity, price: i.price })),
              subtotal: order.subtotal,
              shipping: order.shipping,
              tax: order.tax,
              total: order.total,
              shippingAddress: order.shipping_address || { line1: '', city: '', state: '', postalCode: '', country: 'IN', phone: '' },
            }).catch(() => {});
          }
        }
        break;
      }
      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        const order = await findOne('orders', { razorpay_order_id: payment.order_id });
        if (order) {
          await updateOne('orders', order.id, {
            payment_status: 'failed',
            status: 'cancelled',
          });
        }
        break;
      }
      case 'refund.created': {
        const refund = event.payload.refund.entity;
        const order = await findOne('orders', { razorpay_payment_id: refund.payment_id });
        if (order) {
          await updateOne('orders', order.id, {
            payment_status: 'refunded',
            status: 'refunded',
          });
        }
        break;
      }
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
  }

  res.json({ success: true });
});

export default router;
