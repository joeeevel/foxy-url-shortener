import { Router } from 'express';
import { health } from '../controllers/health.js';
import { shorten } from '../controllers/shorten.js';
import { redirect } from '../controllers/redirect.js';
import { stats } from '../controllers/stats.js';
import {
  healthLimiter,
  shortenLimiter,
  redirectLimiter,
  statsLimiter,
} from '../services/rateLimit.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/health', healthLimiter, asyncHandler(health));
router.post('/shorten', auth, shortenLimiter, asyncHandler(shorten));
router.get('/:shortCode', redirectLimiter, asyncHandler(redirect));
router.get('/stats/:shortCode', statsLimiter, asyncHandler(stats));

export { router };
