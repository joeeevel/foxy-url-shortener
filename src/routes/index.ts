import { Router } from 'express';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { health } from '../controllers/health.js';
import { shorten } from '../controllers/shorten.js';
import { redirect } from '../controllers/redirect.js';
import { stats } from '../controllers/stats.js';
import { listUrls } from '../controllers/list.js';
import { deleteUrl } from '../controllers/delete.js';
import { kryptCreate, kryptGet } from '../controllers/kryptCreate.js';
import {
  healthLimiter,
  shortenLimiter,
  redirectLimiter,
  statsLimiter,
  deleteLimiter,
} from '../services/rateLimit.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { auth } from '../middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const kryptHtml = resolve(__dirname, '..', '..', 'public', 'krypt.html');

const router = Router();

router.get('/health', healthLimiter, asyncHandler(health));
router.post('/shorten', auth, shortenLimiter, asyncHandler(shorten));
router.get('/api/urls', asyncHandler(listUrls));
router.delete('/api/urls/:shortCode', deleteLimiter, asyncHandler(deleteUrl));
router.get('/stats/:shortCode', statsLimiter, asyncHandler(stats));

router.post('/krypt', asyncHandler(kryptCreate));
router.get('/api/krypt/:id', asyncHandler(kryptGet));
router.get('/krypt', (req, res) => res.sendFile(kryptHtml));
router.get('/q/:id', (req, res) => res.sendFile(kryptHtml));

router.get('/:shortCode', redirectLimiter, asyncHandler(redirect));

export { router };
