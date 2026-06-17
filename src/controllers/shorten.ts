import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { setCachedUrl } from '../services/cache.js';
import { logger } from '../lib/logger.js';
import { validateTargetUrl } from '../lib/validateUrl.js';

const TTL_MAP: Record<string, number> = { '1h': 3600, '24h': 86400, '7d': 604800, '30d': 2592000 };

const shortenSchema = z.object({
  url: z.string().url('Invalid URL format'),
  slug: z.string().regex(/^[a-zA-Z0-9_-]{3,30}$/, 'Slug must be 3-30 characters: letters, numbers, hyphens, underscores').optional(),
  webhook: z.string().url('Invalid webhook URL').optional().or(z.literal('')),
  ttl: z.enum(['1h', '24h', '7d', '30d']).optional(),
});

function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 8);
}

export async function shorten(req: Request, res: Response): Promise<void> {
  const parsed = shortenSchema.safeParse(req.body);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid request';
    res.status(400).json({ error: message });
    return;
  }

  const validation = validateTargetUrl(parsed.data.url);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error });
    return;
  }

  let shortCode = parsed.data.slug || generateShortCode();

  if (parsed.data.slug) {
    const existing = await prisma.url.findUnique({ where: { shortCode } });
    if (existing) {
      res.status(409).json({ error: 'Slug is already taken' });
      return;
    }
  }

  const expiresAt = parsed.data.ttl ? new Date(Date.now() + (TTL_MAP[parsed.data.ttl] ?? 0) * 1000) : null;

  const newUrl = await prisma.url.create({
    data: {
      original: parsed.data.url,
      shortCode,
      webhook: parsed.data.webhook || null,
      expiresAt,
    },
  });

  await setCachedUrl(shortCode, newUrl);

  logger.info({ shortCode, original: parsed.data.url }, 'Short URL created');

  res.json({
    success: true,
    shortUrl: `${req.get('x-forwarded-proto') || req.protocol}://${req.get('host')}/${newUrl.shortCode}`,
    shortCode: newUrl.shortCode,
    originalUrl: newUrl.original,
    clicks: newUrl.clicks,
    expiresAt: newUrl.expiresAt?.toISOString() ?? null,
  });
}
