import { describe, it, expect, vi, beforeEach } from 'vitest';

const { redisMock } = vi.hoisted(() => ({
  redisMock: {
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    on: vi.fn(),
  },
}));

vi.mock('ioredis', () => {
  function Redis() {
    return redisMock;
  }
  return { Redis };
});

const { urlKey, getCachedUrl, setCachedUrl, invalidateUrl } = await import('../services/cache.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('urlKey', () => {
  it('returns the correct key format', () => {
    expect(urlKey('abc123')).toBe('url:abc123');
  });
});

describe('getCachedUrl', () => {
  it('returns null when key does not exist', async () => {
    const result = await getCachedUrl('nonexistent');
    expect(result).toBeNull();
  });

  it('returns data after it was set', async () => {
    await setCachedUrl('abc123', {
      original: 'https://example.com',
      clicks: 0,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    });

    const result = await getCachedUrl('abc123');
    expect(result).toEqual({
      original: 'https://example.com',
      clicks: 0,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
  });

  it('returns null after invalidation', async () => {
    await setCachedUrl('abc123', {
      original: 'https://example.com',
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await invalidateUrl('abc123');
    const result = await getCachedUrl('abc123');
    expect(result).toBeNull();
  });
});

describe('setCachedUrl', () => {
  it('stores data', async () => {
    const urlData = {
      original: 'https://example.com',
      clicks: 0,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    await setCachedUrl('abc123', urlData);

    const result = await getCachedUrl('abc123');
    expect(result?.original).toBe('https://example.com');
  });
});

describe('invalidateUrl', () => {
  it('removes the entry', async () => {
    await setCachedUrl('abc123', {
      original: 'https://example.com',
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await invalidateUrl('abc123');
    expect(await getCachedUrl('abc123')).toBeNull();
  });
});
