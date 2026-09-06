import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import { AuthRequest } from '../middleware/auth';

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const { search, category, minPrice, maxPrice, size, sort, page = '1', limit = '12' } = req.query;
    
    const filter: any = {};
    
    if (search) {
      filter.$text = { $search: search as string };
    }
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (size) {
      filter.sizes = { $in: (size as string).split(',') };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let sortOption: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'name') sortOption = { name: 1 };

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limitNum).populate('category'),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
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

export async function getProductBySlug(req: Request, res: Response): Promise<void> {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category');
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getFeaturedProducts(req: Request, res: Response): Promise<void> {
  try {
    const products = await Product.find({ featured: true }).limit(8).populate('category');
    res.json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const categories = await Category.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
