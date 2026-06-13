import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { redis } from '../services/cache.js';

export async function health(req: Request, res: Response): Promise<void> {
  const checks: Record<string, string> = {};

  checks.server = 'ok';

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  if (redis) {
    try {
      await redis.ping();
      checks.redis = 'ok';
    } catch {
      checks.redis = 'error';
    }
  } else {
    checks.redis = 'unavailable';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok' || v === 'unavailable');

  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'url-shortener',
    checks,
  });
}
