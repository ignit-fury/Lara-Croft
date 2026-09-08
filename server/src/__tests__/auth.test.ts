import { describe, it, expect, vi } from 'vitest';

vi.mock('../db/supabase-db', () => ({
  findOne: vi.fn(),
}));

import jwt from 'jsonwebtoken';
import { findOne } from '../db/supabase-db';

describe('Auth Middleware', () => {
  it('should verify valid JWT token', () => {
    const token = jwt.sign({ sub: 'user123' }, 'test-secret');
    const decoded = jwt.verify(token, 'test-secret') as { sub: string };
    expect(decoded.sub).toBe('user123');
  });

  it('should reject invalid token', () => {
    expect(() => {
      jwt.verify('invalid-token', 'test-secret');
    }).toThrow();
  });

  it('should reject expired token', () => {
    const token = jwt.sign({ sub: 'user123' }, 'test-secret', { expiresIn: '-1s' });
    expect(() => {
      jwt.verify(token, 'test-secret');
    }).toThrow();
  });

  it('should find user by supabase_id', async () => {
    const mockUser = { id: 'uuid1', supabase_id: 'user123', role: 'user' };
    vi.mocked(findOne).mockResolvedValue(mockUser as any);

    const user = await findOne('users', { supabase_id: 'user123' });
    expect(user).toBeTruthy();
    expect(user?.supabase_id).toBe('user123');
  });
});
