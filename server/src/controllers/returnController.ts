import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { findMany, updateOne } from '../db/supabase-db';
import { normalize } from '../db/normalize';
import { supabase } from '../db/supabase-db';

export async function createReturnRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('return_requests')
      .insert({
        user_id: req.userId || null,
        order_id: req.body.order_id,
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
