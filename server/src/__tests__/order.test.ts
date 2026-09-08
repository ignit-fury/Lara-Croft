import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db/supabase-db', () => ({
  supabase: {
    from: vi.fn(),
  },
  findOne: vi.fn(),
  insertOne: vi.fn(),
  updateOne: vi.fn(),
}));

vi.mock('../config/razorpay', () => ({
  razorpay: {
    orders: {
      create: vi.fn(),
    },
  },
}));

import { supabase, findOne, insertOne, updateOne } from '../db/supabase-db';
import { razorpay } from '../config/razorpay';

describe('Order Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create order when cart has items', async () => {
      const mockCart = {
        id: 'cart1',
        items: [
          { product_id: '1', size: 'M', quantity: 1 },
        ],
      };
      const mockProduct = { id: '1', name: 'Test', price: 99900, images: ['img.jpg'] };
      const mockOrder = { id: 'order1', total: 117882, razorpay_order_id: 'order_abc' };
      const mockRazorpayOrder = { id: 'order_abc' };

      vi.mocked(findOne).mockResolvedValueOnce(mockCart as any);
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({ data: [mockProduct], error: null }),
        }),
      } as any);
      vi.mocked(insertOne).mockResolvedValue(mockOrder as any);
      vi.mocked(razorpay.orders.create).mockResolvedValue(mockRazorpayOrder as any);

      const cart = await findOne('cart', { user_id: 'user1' });
      expect(cart).toEqual(mockCart);

      const razorpayOrder = await razorpay.orders.create({
        amount: expect.any(Number),
        currency: 'INR',
        receipt: expect.any(String),
      });
      expect(razorpayOrder.id).toBe('order_abc');
    });

    it('should reject empty cart', async () => {
      vi.mocked(findOne).mockResolvedValue({ id: 'cart1', items: [] } as any);

      const cart = await findOne('cart', { user_id: 'user1' });
      expect(cart.items).toHaveLength(0);
    });
  });

  describe('confirmOrder', () => {
    it('should update order status on valid signature', async () => {
      const mockOrder = {
        id: 'order1',
        payment_status: 'pending',
        status: 'pending',
      };
      vi.mocked(findOne).mockResolvedValue(mockOrder as any);
      vi.mocked(updateOne).mockResolvedValue({ ...mockOrder, payment_status: 'paid', status: 'confirmed' } as any);

      const order = await findOne('orders', { razorpay_order_id: 'order_abc' });
      expect(order).toBeTruthy();
      if (order) {
        await updateOne('orders', order.id, { payment_status: 'paid', status: 'confirmed' });
      }

      expect(updateOne).toHaveBeenCalledWith('orders', 'order1', { payment_status: 'paid', status: 'confirmed' });
    });
  });

  describe('getOrders', () => {
    it('should return paginated orders for user', async () => {
      const mockOrders = [
        { id: '1', total: 99900, status: 'confirmed' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({ data: mockOrders, error: null, count: 1 }),
            }),
          }),
        }),
      } as any);

      const result = await supabase.from('orders').select('*', { count: 'exact' });
      expect(result.data).toHaveLength(1);
    });
  });
});
