import { Request, Response } from 'express';
import { supabase } from '../db/supabase-db';
import { AuthRequest } from '../middleware/auth';

export async function getProductReviews(req: Request, res: Response): Promise<void> {
  try {
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('id')
      .eq('slug', req.params.slug as string)
      .single();

    if (prodErr || !product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*, users!inner(name)')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false });

    if (error) {
      // Table might not exist
      console.error('[REVIEWS] Error fetching reviews');
      res.json({ success: true, data: { reviews: [], averageRating: 0, totalCount: 0 } });
      return;
    }

    const safeReviews = (reviews || []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      productId: r.product_id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      userName: r.users?.name || 'Anonymous',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    const totalCount = safeReviews.length;
    const averageRating = totalCount > 0
      ? Math.round((safeReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalCount) * 10) / 10
      : 0;

    res.json({ success: true, data: { reviews: safeReviews, averageRating, totalCount } });
  } catch {
    console.error('[REVIEWS] getProductReviews error');
    res.json({ success: true, data: { reviews: [], averageRating: 0, totalCount: 0 } });
  }
}

export async function createReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    // Validate
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ success: false, error: 'Rating must be an integer between 1 and 5' });
      return;
    }
    if (!title?.trim() || title.trim().length > 500) {
      res.status(400).json({ success: false, error: 'Title is required (max 500 chars)' });
      return;
    }
    if (!comment?.trim() || comment.trim().length > 2000) {
      res.status(400).json({ success: false, error: 'Comment is required (max 2000 chars)' });
      return;
    }

    // Find product
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single();

    if (prodErr || !product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    // Check existing review
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', product.id)
      .maybeSingle();

    if (existing) {
      res.status(400).json({ success: false, error: 'You have already reviewed this product' });
      return;
    }

    // Insert
    const { data: review, error: insertErr } = await supabase
      .from('reviews')
      .insert({
        user_id: userId,
        product_id: product.id,
        rating: ratingNum,
        title: title.trim(),
        comment: comment.trim(),
      })
      .select()
      .single();

    if (insertErr) {
      console.error('[REVIEWS] Insert error');
      res.status(500).json({ success: false, error: 'Failed to create review' });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        id: review.id,
        userId: review.user_id,
        productId: review.product_id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        createdAt: review.created_at,
      },
    });
  } catch {
    console.error('[REVIEWS] createReview error');
    res.status(500).json({ success: false, error: 'Failed to create review' });
  }
}

export async function deleteReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { data: review, error: fetchErr } = await supabase
      .from('reviews')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchErr || !review) {
      res.status(404).json({ success: false, error: 'Review not found' });
      return;
    }

    // Check requesting user's role (not review author's)
    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    const userRole = currentUser?.role;
    if (review.user_id !== userId && userRole !== 'admin' && userRole !== 'super_admin') {
      res.status(403).json({ success: false, error: 'Not authorized to delete this review' });
      return;
    }

    const { error: delErr } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (delErr) {
      res.status(500).json({ success: false, error: 'Failed to delete review' });
      return;
    }

    res.json({ success: true });
  } catch {
    console.error('[REVIEWS] deleteReview error');
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
}
