import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { setCachedUrl } from '../services/cache.js';
import { logger } from '../lib/logger.js';
import { validateTargetUrl } from '../lib/validateUrl.js';
import { checkAbusiveUrl } from '../services/abuseCheck.js';

const bulkSchema = z.object({
  urls: z
    .array(
      z.object({
        url: z.string().url('Invalid URL format'),
        slug: z.string().regex(/^[a-zA-Z0-9_-]{3,30}$/).optional(),
      }),
    )
    .min(1, 'At least one URL is required')
    .max(50, 'Maximum 50 URLs per request'),
  webhook: z.string().url().optional().or(z.literal('')),
  ttl: z.enum(['1h', '24h', '7d', '30d']).optional(),
});

function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 8);
}

export async function bulkShorten(req: Request, res: Response): Promise<void> {
  const parsed = bulkSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' });
    return;
  }

  const TTL_MAP: Record<string, number> = { '1h': 3600, '24h': 86400, '7d': 604800, '30d': 2592000 };
  const expiresAt = parsed.data.ttl ? new Date(Date.now() + (TTL_MAP[parsed.data.ttl] ?? 0) * 1000) : null;
  const results: Array<{ url: string; shortCode: string | null; error?: string | undefined }> = [];

  for (const item of parsed.data.urls) {
    try {
      const validation = validateTargetUrl(item.url);
      if (!validation.valid) {
        results.push({ url: item.url, shortCode: null, error: validation.error });
        continue;
      }

      const abuse = checkAbusiveUrl(item.url);
      if (!abuse.safe) {
        results.push({ url: item.url, shortCode: null, error: `Blocked: ${abuse.reason}` });
        continue;
      }

      let shortCode = item.slug || generateShortCode();
      if (item.slug) {
        const existing = await prisma.url.findUnique({ where: { shortCode } });
        if (existing) {
          results.push({ url: item.url, shortCode: null, error: 'Slug is already taken' });
          continue;
        }
      }

      const newUrl = await prisma.url.create({
        data: {
          original: item.url,
          shortCode,
          webhook: parsed.data.webhook || null,
          expiresAt,
        },
      });

      await setCachedUrl(shortCode, newUrl);
      results.push({ url: item.url, shortCode: newUrl.shortCode });
    } catch (err) {
      logger.error({ err, url: item.url }, 'Bulk shorten failed');
      results.push({ url: item.url, shortCode: null, error: 'Internal error' });
    }
  }

  const succeeded = results.filter((r) => r.shortCode).length;
  const failed = results.filter((r) => r.error).length;

  logger.info({ total: results.length, succeeded, failed }, 'Bulk shorten completed');

  res.json({ results, succeeded, failed });
}
