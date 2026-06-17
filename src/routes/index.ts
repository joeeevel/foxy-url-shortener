import { Router } from 'express';
import { health } from '../controllers/health.js';
import { shorten } from '../controllers/shorten.js';
import { redirect } from '../controllers/redirect.js';
import { stats } from '../controllers/stats.js';
import {
  googleAuthHandler, googleCallbackHandler,
  githubAuthHandler, githubCallbackHandler,
  me, logout,
} from '../controllers/auth.js';
import {
  healthLimiter,
  shortenLimiter,
  redirectLimiter,
  statsLimiter,
} from '../services/rateLimit.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

/* Health */
router.get('/health', healthLimiter, asyncHandler(health));

/* Auth */
router.get('/auth/google', asyncHandler(googleAuthHandler));
router.get('/auth/google/callback', asyncHandler(googleCallbackHandler));
router.get('/auth/github', asyncHandler(githubAuthHandler));
router.get('/auth/github/callback', asyncHandler(githubCallbackHandler));
router.get('/auth/me', me);
router.post('/auth/logout', logout);

/* API */
router.post('/shorten', shortenLimiter, asyncHandler(shorten));
router.get('/stats/:shortCode', statsLimiter, asyncHandler(stats));

/* Redirect */
router.get('/:shortCode', redirectLimiter, asyncHandler(redirect));

export { router };
