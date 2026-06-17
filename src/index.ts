import { app } from './app.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';
import { redis } from './services/cache.js';
import { startHealthChecker } from './services/healthCheck.js';

async function cleanupExpiredUrls() {
  try {
    const { count } = await prisma.url.deleteMany({
      where: { expiresAt: { lte: new Date(), not: null } },
    });
    if (count > 0) logger.info({ count }, 'Cleaned up expired URLs');
  } catch (err) {
    logger.error({ err }, 'Expired URL cleanup failed');
  }
}

if (!process.env.VITEST) {
  cleanupExpiredUrls();
  setInterval(cleanupExpiredUrls, 60 * 60 * 1000);
  startHealthChecker();

  const PORT = process.env.PORT || 3000;

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Server started');
  });

  function shutdown() {
    logger.info('Shutting down gracefully...');
    server.close(async () => {
      await prisma.$disconnect();
      if (redis) await redis.quit().catch(() => {});
      process.exit(0);
    });
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
