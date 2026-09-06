import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { razorpay } from '../config/razorpay';

export async function createCheckoutSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ user: req.userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, error: 'Cart is empty' });
      return;
    }

    const items = cart.items.map((item: any) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      size: item.size,
      quantity: item.quantity,
      image: item.product.images[0],
    }));

    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 5000 ? 0 : 499;
    const tax = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + shipping + tax;

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });

    const order = await Order.create({
      user: req.userId,
      items,
      subtotal,
      shipping,
      tax,
      total: totalAmount,
      currency: 'INR',
      status: 'pending',
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id,
      shippingAddress,
    });

    res.json({ success: true, data: { orderId: razorpayOrder.id, amount: totalAmount, dbOrderId: order._id } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function confirmOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const crypto = await import('crypto');
    const { env } = await import('../config/env');
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ success: false, error: 'Invalid payment signature' });
      return;
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    const User = (await import('../models/User')).default;
    const userDoc = await User.findById(req.userId);
    if (userDoc) {
      const { sendOrderConfirmation } = await import('../services/emailService');
      sendOrderConfirmation({
        to: userDoc.email,
        customerName: userDoc.name,
        orderId: (order._id as any).toString(),
        items: order.items.map((i: any) => ({ name: i.name, size: i.size, quantity: i.quantity, price: i.price })),
        total: order.total,
        shippingAddress: order.shippingAddress,
      });
    }

    await Cart.findOneAndUpdate({ user: req.userId }, { items: [] });

    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments({ user: req.userId }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getOrderById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.userId });
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
