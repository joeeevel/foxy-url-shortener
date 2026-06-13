import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { getCachedUrl, setCachedUrl } from '../services/cache.js';

export async function stats(req: Request, res: Response): Promise<void> {
  const shortCode = req.params.shortCode;

  if (!shortCode) {
    res.status(404).json({ error: 'Short URL not found' });
    return;
  }

  const cached = await getCachedUrl(shortCode);
  if (cached) {
    res.json({
      shortCode,
      originalUrl: cached.original,
      clicks: cached.clicks,
      createdAt: cached.createdAt,
      lastAccessed: cached.updatedAt,
    });
    return;
  }

  const url = await prisma.url.findUnique({
    where: { shortCode },
  });

  if (!url) {
    res.status(404).json({ error: 'Short URL not found' });
    return;
  }

  await setCachedUrl(shortCode, url);

  res.json({
    shortCode: url.shortCode,
    originalUrl: url.original,
    clicks: url.clicks,
    createdAt: url.createdAt,
    lastAccessed: url.updatedAt,
  });
}
