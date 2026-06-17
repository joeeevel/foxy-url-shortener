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

export async function analytics(req: Request, res: Response): Promise<void> {
  const user = req.user as { id: string } | undefined;
  const shortCode = req.params.shortCode;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = 50;
  const offset = (page - 1) * limit;

  if (!shortCode) {
    res.status(404).json({ error: 'Short URL not found' });
    return;
  }

  const url = user
    ? await prisma.url.findFirst({ where: { shortCode, userId: user.id } })
    : await prisma.url.findUnique({ where: { shortCode } });

  if (!url) {
    res.status(404).json({ error: 'Short URL not found' });
    return;
  }

  const [clicks, total] = await Promise.all([
    prisma.click.findMany({
      where: { urlId: url.id },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.click.count({ where: { urlId: url.id } }),
  ]);

  const referrers = await prisma.click.groupBy({
    by: ['referrer'],
    where: { urlId: url.id, referrer: { not: null } },
    _count: true,
    orderBy: { _count: { referrer: 'desc' } },
    take: 10,
  });

  res.json({
    shortCode,
    totalClicks: total,
    page,
    pages: Math.ceil(total / limit),
    clicks: clicks.map((c) => ({
      timestamp: c.timestamp,
      referrer: c.referrer,
      userAgent: c.userAgent,
      country: c.country,
    })),
    topReferrers: referrers.map((r) => ({
      referrer: r.referrer,
      count: r._count,
    })),
  });
}
