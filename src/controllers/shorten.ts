import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { setCachedUrl } from '../services/cache.js';
import { logger } from '../lib/logger.js';

function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 8);
}

export async function shorten(req: Request, res: Response): Promise<void> {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL is required' });
    return;
  }

  try {
    new URL(url);
  } catch {
    res.status(400).json({ error: 'Invalid URL format' });
    return;
  }

  const shortCode = generateShortCode();

  const newUrl = await prisma.url.create({
    data: {
      original: url,
      shortCode,
    },
  });

  await setCachedUrl(shortCode, newUrl);

  logger.info({ shortCode, original: url }, 'Short URL created');

  res.json({
    success: true,
    shortUrl: `${req.protocol}://${req.get('host')}/${newUrl.shortCode}`,
    shortCode: newUrl.shortCode,
    originalUrl: newUrl.original,
    clicks: newUrl.clicks,
  });
}
