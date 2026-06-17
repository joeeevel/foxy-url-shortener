import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';

export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.isAuthenticated()) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token.startsWith('foxy_')) {
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const apiKey = await prisma.apiKey.findUnique({ where: { key: hash } });
      if (apiKey) {
        const user = await prisma.user.findUnique({ where: { id: apiKey.userId } });
        if (user) {
          req.user = user as Express.User;
          prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsed: new Date() } }).catch(() => {});
        }
      }
    }
  }

  next();
}

export async function requireSessionAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  res.status(401).json({ error: 'Authentication required' });
}
