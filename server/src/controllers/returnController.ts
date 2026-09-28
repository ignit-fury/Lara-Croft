import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabase, updateOne } from '../db/supabase-db';
import { normalize } from '../db/normalize';

interface Eligibility {
  order?: any;
  reason?: string;
}

async function resolveOrder(input: string): Promise<any | null> {
  const id = (input || '').trim();
  if (!id) return null;
  try {
    const { data } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
    if (data) return data;
  } catch { /* fall through to suffix match */ }
  // No ilike on the uuid column (Postgres has no ~~* for uuid) — filter in code.
  if (id.length >= 4) {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200);
    const hits = (data || []).filter((o: any) => (o.id || '').toLowerCase().includes(id.toLowerCase()));
    if (hits.length === 1) return hits[0];
  }
  return null;
}

/** Shared eligibility gate used by verify AND create (never trust the client alone). */
async function checkEligibility(orderId: string, email: string, userId?: string): Promise<Eligibility> {
  const order = await resolveOrder(orderId);
  if (!order) return { reason: 'Order not found. Check the Order ID from your Account page.' };
  if (order.payment_status !== 'paid') return { reason: 'Only paid orders can be returned.' };
  if (!['confirmed', 'delivered'].includes(order.status)) {
    return { reason: `This order is ${order.status} and is not eligible for return.` };
  }
  // Ownership: logged-in user must own it, otherwise email must match the buyer
  if (userId) {
    if (order.user_id !== userId) return { reason: 'This order belongs to a different account.' };
  } else {
    const { data: owner } = await supabase.from('users').select('email').eq('id', order.user_id).maybeSingle();
    if (!owner || (owner.email || '').toLowerCase() !== (email || '').trim().toLowerCase()) {
      return { reason: 'Order ID and email do not match our records.' };
    }
  }
  const { data: existing } = await supabase
    .from('return_requests')
    .select('id,status')
    .eq('order_id', order.id)
    .in('status', ['pending', 'approved', 'completed'])
    .limit(1);
  if (existing && existing.length > 0) {
    return { reason: `A return request for this order already exists (${existing[0].status}).` };
  }
  return { order };
}

export async function createReturnRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await checkEligibility(req.body.order_id, req.body.email, req.userId);
    if (!result.order) {
      res.status(400).json({ success: false, error: result.reason });
      return;
    }
    const { data, error } = await supabase
      .from('return_requests')
      .insert({
        user_id: req.userId || null,
        order_id: result.order.id,
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
    const result = await checkEligibility(req.body.order_id, req.body.email, req.userId);
    if (!result.order) {
      res.json({ success: true, data: { valid: false, reason: result.reason } });
      return;
    }
    const order = result.order;
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
