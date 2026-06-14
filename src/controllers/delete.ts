import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { invalidateUrl } from '../services/cache.js';

export async function deleteUrl(req: Request, res: Response): Promise<void> {
  const shortCode = req.params.shortCode;

  if (!shortCode) {
    res.status(400).json({ error: 'Short code is required' });
    return;
  }

  const url = await prisma.url.findUnique({ where: { shortCode } });

  if (!url) {
    res.status(404).json({ error: 'Short URL not found' });
    return;
  }

  await prisma.url.delete({ where: { shortCode } });
  await invalidateUrl(shortCode);

  res.json({ success: true });
}
