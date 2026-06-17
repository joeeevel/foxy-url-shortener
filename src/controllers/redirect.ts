import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { getCachedUrl, setCachedUrl } from '../services/cache.js';

export async function redirect(req: Request, res: Response): Promise<void> {
  const shortCode = req.params.shortCode;
  if (!shortCode) {
    res.status(404).json({ error: 'Short URL not found' });
    return;
  }

  const cached = await getCachedUrl(shortCode);
  if (cached) {
    prisma.url
      .update({
        where: { shortCode },
        data: { clicks: { increment: 1 } },
      })
      .then((updated) => setCachedUrl(shortCode, updated))
      .catch(() => {});

    prisma.click.create({
      data: {
        url: { connect: { shortCode } },
        referrer: req.get('referer') || null,
        userAgent: req.get('user-agent') || null,
        ip: req.ip || null,
      },
    }).catch(() => {});

    res.redirect(cached.original);
    return;
  }

  try {
    const url = await prisma.url.update({
      where: { shortCode },
      data: { clicks: { increment: 1 } },
    });

    await setCachedUrl(shortCode, url);

    prisma.click.create({
      data: {
        urlId: url.id,
        referrer: req.get('referer') || null,
        userAgent: req.get('user-agent') || null,
        ip: req.ip || null,
      },
    }).catch(() => {});

    res.redirect(url.original);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: unknown }).code === 'P2025') {
      res.status(404).json({ error: 'Short URL not found' });
      return;
    }
    throw error;
  }
}
