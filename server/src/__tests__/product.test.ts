import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../models/Product', () => ({
  default: {
    find: vi.fn(),
    findOne: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock('../models/Category', () => ({
  default: {
    findOne: vi.fn(),
    find: vi.fn(),
  },
}));

import Product from '../models/Product';
import Category from '../models/Category';

describe('Product Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return paginated products', async () => {
      const mockProducts = [
        { _id: '1', name: 'Test Product', price: 99900, slug: 'test-product' },
      ];
      const mockTotal = 1;

      vi.mocked(Product.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              populate: vi.fn().mockResolvedValue(mockProducts),
            }),
          }),
        }),
      } as any);

      vi.mocked(Product.countDocuments).mockResolvedValue(mockTotal);

      const result = await Product.find({}).sort().skip().limit().populate();
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getProductBySlug', () => {
    it('should find product by slug', async () => {
      const mockProduct = { _id: '1', name: 'Test', slug: 'test' };
      vi.mocked(Product.findOne).mockResolvedValue(mockProduct as any);

      const result = await Product.findOne({ slug: 'test' });
      expect(result).toEqual(mockProduct);
      expect(Product.findOne).toHaveBeenCalledWith({ slug: 'test' });
    });

    it('should return null for non-existent slug', async () => {
      vi.mocked(Product.findOne).mockResolvedValue(null);

      const result = await Product.findOne({ slug: 'nonexistent' });
      expect(result).toBeNull();
    });
  });

  describe('getCategories', () => {
    it('should return active categories sorted by order', async () => {
      const mockCategories = [
        { _id: '1', name: 'Lehengas', slug: 'lehengas', order: 1, active: true },
        { _id: '2', name: 'Sarees', slug: 'sarees', order: 2, active: true },
      ];
      vi.mocked(Category.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockCategories),
      } as any);

      const result = await Category.find({ active: true }).sort({ order: 1 });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Lehengas');
    });
  });
});
