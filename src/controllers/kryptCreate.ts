import type { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export async function kryptCreate(req: Request, res: Response): Promise<void> {
  const { payload } = req.body;

  if (!payload || typeof payload !== 'string') {
    res.status(400).json({ error: 'Encrypted payload is required' });
    return;
  }

  if (payload.length > 12000) {
    res.status(413).json({ error: 'Payload too large' });
    return;
  }

  const id = crypto.randomBytes(6).toString('base64url');

  await prisma.kryptLink.create({
    data: { id, payload },
  });

  logger.info({ id }, 'KryptLink created');

  res.json({ id });
}

export async function kryptGet(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'ID is required' });
    return;
  }

  const link = await prisma.kryptLink.findUnique({ where: { id } });

  if (!link) {
    res.status(404).json({ error: 'Link not found' });
    return;
  }

  res.json({ payload: link.payload });
}
