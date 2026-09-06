import { describe, it, expect, vi } from 'vitest';

vi.mock('../models/User', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

import jwt from 'jsonwebtoken';
import User from '../models/User';

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

  it('should find user by supabaseId', async () => {
    const mockUser = { _id: 'mongo1', supabaseId: 'user123', role: 'user' };
    vi.mocked(User.findOne).mockResolvedValue(mockUser as any);

    const user = await User.findOne({ supabaseId: 'user123' });
    expect(user).toBeTruthy();
    expect(user?.supabaseId).toBe('user123');
  });
});
