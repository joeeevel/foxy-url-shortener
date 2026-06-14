import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function listUrls(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const search = (req.query.search as string) || '';
  const limit = 50;
  const offset = (page - 1) * limit;

  const where = search
    ? { original: { contains: search, mode: 'insensitive' as const } }
    : {};

  const [urls, total] = await Promise.all([
    prisma.url.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.url.count({ where }),
  ]);

  res.json({
    urls: urls.map((u) => ({
      id: u.id,
      shortCode: u.shortCode,
      originalUrl: u.original,
      clicks: u.clicks,
      createdAt: u.createdAt,
      lastAccessed: u.updatedAt,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
