import { Router } from 'express';
import { health } from '../controllers/health.js';
import { shorten } from '../controllers/shorten.js';
import { redirect } from '../controllers/redirect.js';
import { stats } from '../controllers/stats.js';
import { listUrls } from '../controllers/list.js';
import { deleteUrl } from '../controllers/delete.js';
import {
  healthLimiter,
  shortenLimiter,
  redirectLimiter,
  statsLimiter,
  deleteLimiter,
} from '../services/rateLimit.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/health', healthLimiter, asyncHandler(health));
router.post('/shorten', auth, shortenLimiter, asyncHandler(shorten));
router.get('/api/urls', asyncHandler(listUrls));
router.delete('/api/urls/:shortCode', deleteLimiter, asyncHandler(deleteUrl));
router.get('/stats/:shortCode', statsLimiter, asyncHandler(stats));
router.get('/:shortCode', redirectLimiter, asyncHandler(redirect));

export { router };
