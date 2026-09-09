import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabase, findById, insertOne, updateOne, deleteOne, countRows } from '../db/supabase-db';
import { normalize } from '../db/normalize';

export async function getDashboardStats(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const [totalOrders, totalUsers, totalProducts] = await Promise.all([
      countRows('orders'),
      countRows('users'),
      countRows('products'),
    ]);

    const { data: revenueData } = await supabase
      .from('orders')
      .select('total')
      .eq('payment_status', 'paid');
    const totalRevenue = (revenueData || []).reduce((sum: number, o: any) => sum + o.total, 0);

    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: statusData } = await supabase
      .from('orders')
      .select('status');
    const ordersByStatus = (statusData || []).reduce((acc: any, o: any) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        totalUsers,
        totalProducts,
        recentOrders: normalize(recentOrders) || [],
        ordersByStatus: Object.entries(ordersByStatus).map(([status, count]) => ({ status, count })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { page = '1', limit = '20', status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from('orders')
      .select('*, users(name, email)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status as string);
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

export async function updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status } = req.body;
    const id = req.params.id as string;
    const existing = await findById('orders', id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
    if (existing.status === 'delivered' || existing.status === 'cancelled') {
      res.status(400).json({ success: false, error: 'Cannot change status of delivered or cancelled order' });
      return;
    }
    const order = await updateOne('orders', id, { status });
    res.json({ success: true, data: normalize(order) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

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

export async function updateUserRole(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'manager'].includes(role)) {
      res.status(400).json({ success: false, error: 'Invalid role' });
      return;
    }
    const id = req.params.id as string;

    // Only super_admin can change roles
    if (req.user?.role !== 'super_admin') {
      res.status(403).json({ success: false, error: 'Only super admin can change roles' });
      return;
    }

    // Check if target user is super_admin — cannot change their role
    const targetUser = await findById('users', id);
    if (!targetUser) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    if (targetUser.role === 'super_admin') {
      res.status(403).json({ success: false, error: 'Cannot change super admin role' });
      return;
    }

    const user = await updateOne('users', id, { role });
    res.json({ success: true, data: normalize(user) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { originalPrice, categoryId, stockBySize, ...rest } = req.body;
    const payload = {
      ...rest,
      ...(originalPrice !== undefined && { original_price: originalPrice }),
      ...(categoryId !== undefined && { category_id: categoryId }),
      ...(stockBySize !== undefined && { stock_by_size: stockBySize }),
    };
    const product = await insertOne('products', payload);
    res.status(201).json({ success: true, data: normalize(product) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { originalPrice, categoryId, stockBySize, ...rest } = req.body;
    const payload = {
      ...rest,
      ...(originalPrice !== undefined && { original_price: originalPrice }),
      ...(categoryId !== undefined && { category_id: categoryId }),
      ...(stockBySize !== undefined && { stock_by_size: stockBySize }),
    };
    const product = await updateOne('products', id, payload);
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    res.json({ success: true, data: normalize(product) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await deleteOne('products', id);
    res.json({ success: true, data: { message: 'Product deleted' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
