import { supabase } from '../config/supabase';

export { supabase };

// Re-export helpers for common patterns
export async function findById(table: string, id: string) {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function findOne(table: string, filters: Record<string, any>) {
  let query = supabase.from(table).select('*');
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}

export async function findMany(table: string, filters: Record<string, any> = {}) {
  let query = supabase.from(table).select('*');
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function insertOne(table: string, record: Record<string, any>) {
  const { data, error } = await supabase.from(table).insert(record).select().single();
  if (error) throw error;
  return data;
}

export async function updateOne(table: string, id: string, updates: Record<string, any>) {
  const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteOne(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function countRows(table: string, filters: Record<string, any> = {}) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  }
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

export async function rpc(fnName: string, params: Record<string, any> = {}) {
  const { data, error } = await supabase.rpc(fnName, params);
  if (error) throw error;
  return data;
}
