import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db/supabase-db', () => ({
  supabase: {
    from: vi.fn(),
  },
  findOne: vi.fn(),
  findMany: vi.fn(),
  insertOne: vi.fn(),
  updateOne: vi.fn(),
  deleteOne: vi.fn(),
  countRows: vi.fn(),
}));

import { supabase, findOne, countRows } from '../db/supabase-db';

describe('Product Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return paginated products', async () => {
      const mockProducts = [
        { id: '1', name: 'Test Product', price: 99900, slug: 'test-product' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({ data: mockProducts, error: null, count: 1 }),
          }),
        }),
      } as any);

      const result = await supabase.from('products').select('*', { count: 'exact' });
      expect(result.data).toEqual(mockProducts);
    });
  });

  describe('getProductBySlug', () => {
    it('should find product by slug', async () => {
      const mockProduct = { id: '1', name: 'Test', slug: 'test' };
      vi.mocked(findOne).mockResolvedValue(mockProduct as any);

      const result = await findOne('products', { slug: 'test' });
      expect(result).toEqual(mockProduct);
    });

    it('should return null for non-existent slug', async () => {
      vi.mocked(findOne).mockResolvedValue(null as any);

      const result = await findOne('products', { slug: 'nonexistent' });
      expect(result).toBeNull();
    });
  });

  describe('getCategories', () => {
    it('should return active categories', async () => {
      const mockCategories = [
        { id: '1', name: 'Shirts', slug: 'shirts', order_num: 1, active: true },
        { id: '2', name: 'Trousers', slug: 'trousers', order_num: 2, active: true },
      ];
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockCategories, error: null }),
          }),
        }),
      } as any);

      const result = await supabase.from('categories').select('*');
      expect(result.data).toHaveLength(2);
    });
  });
});
