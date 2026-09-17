import { describe, it, expect, vi } from 'vitest';

vi.mock('../db/supabase-db', () => ({
  findOne: vi.fn(),
  findById: vi.fn(),
  findMany: vi.fn(),
  insertOne: vi.fn(),
  updateOne: vi.fn(),
  supabase: { from: vi.fn() },
}));

import {
  addressSchema,
  normalizeAddress,
  createCheckoutSessionSchema,
  normalizeCheckout,
  addToCartSchema,
  removeFromCartSchema,
  syncUserSchema,
} from '../validation/schemas';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { errorHandler } from '../middleware/errorHandler';

const UUID = '123e4567-e89b-12d3-a456-426614174000';

const NEW_ADDRESS = {
  label: 'Home',
  line1: '221B Baker Street',
  line2: '',
  city: 'Mumbai',
  state: 'MH',
  postalCode: '400001',
  country: 'IN',
  phone: '9876543210',
};

const OLD_ADDRESS = {
  label: 'Home',
  street: '221B Baker Street',
  city: 'Mumbai',
  state: 'MH',
  zip: '400001',
  country: 'IN',
  phone: '9876543210',
};

function mockRes() {
  const res: any = { statusCode: 200, body: null };
  res.status = (c: number) => {
    res.statusCode = c;
    return res;
  };
  res.json = (b: any) => {
    res.body = b;
    return res;
  };
  return res;
}

describe('backward compat (Plan A)', () => {
  it('1. old address request normalizes and succeeds', () => {
    const n = normalizeAddress({ ...OLD_ADDRESS });
    expect(n.legacyUsed).toBe(true);
    const parsed = addressSchema.safeParse(n.data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.line1).toBe('221B Baker Street');
      expect(parsed.data.postalCode).toBe('400001');
      expect((parsed.data as any).street).toBeUndefined();
      expect((parsed.data as any).zip).toBeUndefined();
    }
  });

  it('2. new address request succeeds without legacy flag', () => {
    const n = normalizeAddress({ ...NEW_ADDRESS });
    expect(n.legacyUsed).toBe(false);
    expect(addressSchema.safeParse(n.data).success).toBe(true);
  });

  it('3. missing required field -> 400', () => {
    const { city, ...noCity } = NEW_ADDRESS;
    const req: any = { method: 'POST', path: '/auth/addresses', body: noCity };
    const res = mockRes();
    const next = vi.fn();
    validate(addressSchema, { normalize: normalizeAddress, stage: 'address' })(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.body.stage).toBe('address');
  });

  it('4. malformed canonical data -> 400', () => {
    // non-numeric quantity cannot coerce
    expect(addToCartSchema.safeParse({ productId: UUID, quantity: 'abc' }).success).toBe(false);
    // non-uuid product id rejected
    expect(addToCartSchema.safeParse({ productId: 'not-a-uuid', quantity: 1 }).success).toBe(false);
    // numeric-string quantity accepted at boundary, coerced strict
    const coerced = addToCartSchema.safeParse({ productId: UUID, quantity: '2' });
    expect(coerced.success).toBe(true);
  });

  it('5. missing authentication -> 401 (never 400/403)', async () => {
    const req: any = { headers: {} };
    const res = mockRes();
    const next = vi.fn();
    await authenticate(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });

  it('6. authenticated but unauthorized -> 403', () => {
    const req: any = { user: { role: 'customer' } };
    const res = mockRes();
    const next = vi.fn();
    authorize('admin')(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });

  it('7. unexpected server failure -> 500 with generic message', () => {
    const res = mockRes();
    errorHandler(new Error('boom: db exploded'), {} as any, res, vi.fn());
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Internal server error');
  });

  it('8. valid checkout request creates canonical session payload', () => {
    const parsed = createCheckoutSessionSchema.safeParse({ shippingAddress: NEW_ADDRESS });
    expect(parsed.success).toBe(true);
  });

  it('9. old checkout request normalizes and validates', () => {
    const n = normalizeCheckout({ address: { ...OLD_ADDRESS } });
    expect(n.legacyUsed).toBe(true);
    const parsed = createCheckoutSessionSchema.safeParse(n.data);
    expect(parsed.success).toBe(true);
  });

  it('10. existing user session continues working', () => {
    // Exact payload shape sent by useAuth (includes avatar extra)
    const syncPayload = {
      supabaseId: 'google-oauth-sub-123',
      email: 'user@example.com',
      name: 'Test User',
      avatar: 'https://example.com/a.png',
    };
    const parsed = syncUserSchema.safeParse(syncPayload);
    expect(parsed.success).toBe(true);
    // Identity fields never defaulted; unknown junk stripped, not passed through
    const withJunk: any = { ...syncPayload, role: 'admin' };
    const p2 = syncUserSchema.safeParse(withJunk);
    expect(p2.success).toBe(true);
    if (p2.success) expect((p2.data as any).role).toBeUndefined();
    // remove-from-cart validates query params (frontend sends query, not body)
    const q = removeFromCartSchema.safeParse({ productId: UUID, size: 'M' });
    expect(q.success).toBe(true);
  });

  it('validate middleware passes normalized legacy body to controller', () => {
    const req: any = { method: 'POST', path: '/auth/addresses', body: { ...OLD_ADDRESS } };
    const res = mockRes();
    const next = vi.fn();
    validate(addressSchema, { normalize: normalizeAddress, stage: 'address' })(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.body.line1).toBe('221B Baker Street');
    expect(req.body.postalCode).toBe('400001');
  });
});
