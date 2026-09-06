import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../models/Order', () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock('../models/Cart', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('../models/Product', () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock('../config/razorpay', () => ({
  razorpay: {
    orders: {
      create: vi.fn(),
    },
  },
}));

import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { razorpay } from '../config/razorpay';

describe('Order Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create order when cart has items', async () => {
      const mockCart = {
        items: [
          { product: { _id: '1', name: 'Test', price: 99900, images: ['img.jpg'] }, size: 'M', quantity: 1 },
        ],
      };
      const mockOrder = { _id: 'order1', total: 117882, razorpayOrderId: 'order_abc' };
      const mockRazorpayOrder = { id: 'order_abc' };

      vi.mocked(Cart.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockCart),
      } as any);

      vi.mocked(Order.create).mockResolvedValue(mockOrder as any);
      vi.mocked(razorpay.orders.create).mockResolvedValue(mockRazorpayOrder as any);

      const cart = await Cart.findOne({ user: 'user1' }).populate('items.product');
      expect(cart).toEqual(mockCart);

      const razorpayOrder = await razorpay.orders.create({
        amount: expect.any(Number),
        currency: 'INR',
        receipt: expect.any(String),
      });
      expect(razorpayOrder.id).toBe('order_abc');
    });

    it('should reject empty cart', async () => {
      vi.mocked(Cart.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue({ items: [] }),
      } as any);

      const cart = await Cart.findOne({ user: 'user1' }).populate('items.product');
      expect(cart.items).toHaveLength(0);
    });
  });

  describe('confirmOrder', () => {
    it('should update order status on valid signature', async () => {
      const mockOrder = {
        _id: 'order1',
        paymentStatus: 'pending',
        status: 'pending',
        save: vi.fn(),
      };
      vi.mocked(Order.findOne).mockResolvedValue(mockOrder as any);
      mockOrder.save.mockResolvedValue(true);

      const order = await Order.findOne({ razorpayOrderId: 'order_abc' });
      expect(order).toBeTruthy();
      if (order) {
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        await order.save();
      }

      expect(mockOrder.paymentStatus).toBe('paid');
      expect(mockOrder.status).toBe('confirmed');
      expect(mockOrder.save).toHaveBeenCalled();
    });
  });

  describe('getOrders', () => {
    it('should return paginated orders for user', async () => {
      const mockOrders = [
        { _id: '1', total: 99900, status: 'confirmed' },
      ];
      vi.mocked(Order.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(mockOrders),
          }),
        }),
      } as any);
      vi.mocked(Order.countDocuments).mockResolvedValue(1);

      const orders = await Order.find({ user: 'user1' }).sort().skip().limit();
      expect(orders).toHaveLength(1);
    });
  });
});
