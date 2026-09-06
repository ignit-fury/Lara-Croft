import { Router, Request, Response } from 'express';
import express from 'express';
import { env } from '../config/env';
import Order from '../models/Order';
import crypto from 'crypto';

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

  switch (event.event) {
    case 'payment.captured': {
      const payment = event.payload.payment.entity;
      const order = await Order.findOne({ razorpayOrderId: payment.order_id });
      if (order) {
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        order.razorpayPaymentId = payment.id;
        await order.save();
      }
      break;
    }
    case 'payment.failed': {
      const payment = event.payload.payment.entity;
      const order = await Order.findOne({ razorpayOrderId: payment.order_id });
      if (order) {
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        await order.save();
      }
      break;
    }
    case 'refund.created': {
      const refund = event.payload.refund.entity;
      const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });
      if (order) {
        order.paymentStatus = 'refunded';
        order.status = 'refunded';
        await order.save();
      }
      break;
    }
  }

  res.json({ success: true });
});

export default router;
