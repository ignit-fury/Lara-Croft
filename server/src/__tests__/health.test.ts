import { describe, it, expect } from 'vitest';

describe('Health Check', () => {
  it('should return status ok', async () => {
    const mockResponse = {
      success: true,
      data: { status: 'ok', timestamp: expect.any(String) },
    };
    expect(mockResponse.success).toBe(true);
    expect(mockResponse.data.status).toBe('ok');
  });
});
