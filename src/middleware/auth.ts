import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

const API_KEY = process.env.API_KEY;

export function auth(req: Request, res: Response, next: NextFunction): void {
  if (!API_KEY) {
    next();
    return;
  }

  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ') || header.slice(7) !== API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}
