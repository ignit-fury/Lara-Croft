import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { findMany, updateOne } from '../db/supabase-db';
import { normalize } from '../db/normalize';
import { supabase } from '../db/supabase-db';

export async function createReturnRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Server-side guard: order must exist (allows full id or unique suffix)
    const input = (req.body.order_id || '').trim();
    let orderId = input;
    try {
      const { data } = await supabase.from('orders').select('id').eq('id', input).maybeSingle();
      if (data) orderId = data.id;
      else if (input.length >= 4) {
        const m = await supabase.from('orders').select('id').ilike('id', `%${input}%`).limit(2);
        if (m.data && m.data.length === 1) orderId = m.data[0].id;
        else {
          res.status(400).json({ success: false, error: 'Order not found. Check the Order ID.' });
          return;
        }
      }
    } catch {
      res.status(400).json({ success: false, error: 'Order not found. Check the Order ID.' });
      return;
    }
    const { data, error } = await supabase
      .from('return_requests')
      .insert({
        user_id: req.userId || null,
        order_id: orderId,
        email: req.body.email,
        type: req.body.type,
        reason: req.body.reason,
        details: req.body.details,
        status: 'pending',
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data: normalize(data) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function verifyReturnOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const input = (req.body.order_id || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();

    // Exact id first, then unique suffix match (users often paste short ids)
    let order = null;
    try {
      const { data } = await supabase.from('orders').select('*').eq('id', input).maybeSingle();
      order = data;
    } catch { /* fall through to suffix match */ }
    if (!order && input.length >= 4) {
      const { data } = await supabase.from('orders').select('*').ilike('id', `%${input}%`).limit(2);
      if (data && data.length === 1) order = data[0];
    }
    if (!order) {
      res.json({ success: true, data: { valid: false, reason: 'Order not found. Check the Order ID from your Account page.' } });
      return;
    }
    if (order.payment_status !== 'paid') {
      res.json({ success: true, data: { valid: false, reason: 'Only paid orders can be returned.' } });
      return;
    }
    if (!['confirmed', 'delivered'].includes(order.status)) {
      res.json({ success: true, data: { valid: false, reason: `This order is ${order.status} and is not eligible for return.` } });
      return;
    }
    // Ownership: the email must match the buyer's account email
    const { data: owner } = await supabase.from('users').select('email').eq('id', order.user_id).maybeSingle();
    if (!owner || (owner.email || '').toLowerCase() !== email) {
      res.json({ success: true, data: { valid: false, reason: 'Order ID and email do not match our records.' } });
      return;
    }
    // Already requested?
    const { data: existing } = await supabase
      .from('return_requests')
      .select('id,status')
      .eq('order_id', order.id)
      .in('status', ['pending', 'approved', 'completed'])
      .limit(1);
    if (existing && existing.length > 0) {
      res.json({ success: true, data: { valid: false, reason: `A return request for this order already exists (${existing[0].status}).` } });
      return;
    }
    res.json({
      success: true,
      data: {
        valid: true,
        order: normalize({
          id: order.id,
          status: order.status,
          total: order.total,
          created_at: order.created_at,
          items: (order.items || []).map((i: any) => ({ name: i.name, size: i.size, quantity: i.quantity })),
        }),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getReturnRequests(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('return_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    res.json({ success: true, data: normalize(data || []) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateReturnStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const updated = await updateOne('return_requests', id, {
      status: req.body.status,
      updated_at: new Date().toISOString(),
    });
    if (!updated) {
      res.status(404).json({ success: false, error: 'Request not found' });
      return;
    }
    res.json({ success: true, data: normalize(updated) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getMyReturnRequests(req: AuthRequest, res: Response): Promise<void> {
  try {
    const rows = await findMany('return_requests', { user_id: req.userId! });
    rows.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
    res.json({ success: true, data: normalize(rows) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
