import { Router } from 'express';
import { health } from '../controllers/health.js';
import { shorten } from '../controllers/shorten.js';
import { redirect } from '../controllers/redirect.js';
import { stats, analytics } from '../controllers/stats.js';
import { listUrls, updateUrl, deleteUrl } from '../controllers/urls.js';
import { listApiKeys, createApiKey, deleteApiKey } from '../controllers/apiKeys.js';
import {
  googleAuthHandler, googleCallbackHandler,
  githubAuthHandler, githubCallbackHandler,
  me, logout,
} from '../controllers/auth.js';
import {
  healthLimiter, shortenLimiter, redirectLimiter, statsLimiter,
} from '../services/rateLimit.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { optionalAuth, requireSessionAuth } from '../middleware/apiAuth.js';

const router = Router();

/* Health */
router.get('/health', healthLimiter, asyncHandler(health));

/* Auth */
router.get('/auth/google', googleAuthHandler);
router.get('/auth/google/callback', googleCallbackHandler);
router.get('/auth/github', githubAuthHandler);
router.get('/auth/github/callback', githubCallbackHandler);
router.get('/auth/me', me);
router.post('/auth/logout', logout);

/* User */
router.get('/api/keys', requireSessionAuth, asyncHandler(listApiKeys));
router.post('/api/keys', requireSessionAuth, asyncHandler(createApiKey));
router.delete('/api/keys/:id', requireSessionAuth, asyncHandler(deleteApiKey));

/* URLs */
router.post('/shorten', shortenLimiter, asyncHandler(shorten));
router.get('/api/urls', optionalAuth, asyncHandler(listUrls));
router.patch('/api/urls/:shortCode', optionalAuth, asyncHandler(updateUrl));
router.delete('/api/urls/:shortCode', optionalAuth, asyncHandler(deleteUrl));

/* Analytics */
router.get('/stats/:shortCode', statsLimiter, asyncHandler(stats));
router.get('/api/analytics/:shortCode', optionalAuth, asyncHandler(analytics));

/* Redirect */
router.get('/:shortCode', redirectLimiter, asyncHandler(redirect));

export { router };
