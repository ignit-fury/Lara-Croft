import { Request, Response } from 'express';
import { supabase, findOne } from '../db/supabase-db';
import { normalize } from '../db/normalize';

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const { search, category, minPrice, maxPrice, size, sort, onSale, page = '1', limit = '12' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from('products')
      .select('*, categories!inner(id, name, slug)', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (category) {
      const cat = await findOne('categories', { slug: category as string });
      if (cat) query = query.eq('category_id', cat.id);
    }
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));
    if (size) {
      const sizes = (size as string).split(',');
      query = query.overlaps('sizes', sizes);
    }

    if (onSale === 'true') {
      query = query.filter('original_price', 'gt', 'price');
    }

    if (sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false });
    else if (sort === 'name') query = query.order('name', { ascending: true });
    else query = query.order('created_at', { ascending: false });

    query = query.range(from, to);

    const { data, error, count } = await query;
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

export async function getProductBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories!inner(id, name, slug)')
      .eq('slug', req.params.slug as string)
      .single();

    if (error || !data) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    res.json({ success: true, data: normalize(data) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getFeaturedProducts(req: Request, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories!inner(id, name, slug)')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) throw error;
    res.json({ success: true, data: normalize(data) || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getCategories(_req: Request, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('order_num', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: normalize(data) || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
