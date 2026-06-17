import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

const CHECK_INTERVAL = 24 * 60 * 60 * 1000;

export async function checkUrlHealth(): Promise<void> {
  try {
    const urls = await prisma.url.findMany({
      where: { active: true, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    let checked = 0;
    let dead = 0;

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(url.original, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'manual',
        });
        clearTimeout(timeout);

        if (res.status >= 400) {
          dead++;
          logger.warn({ shortCode: url.shortCode, original: url.original, status: res.status }, 'URL returned error');
        }
        checked++;
      } catch {
        dead++;
        logger.warn({ shortCode: url.shortCode, original: url.original }, 'URL unreachable');
      }

      /* small delay to avoid rate limiting */
      await new Promise((r) => setTimeout(r, 200));
    }

    if (checked > 0) {
      logger.info({ checked, dead, healthy: checked - dead }, 'URL health check completed');
    }
  } catch (err) {
    logger.error({ err }, 'URL health check failed');
  }
}

export function startHealthChecker(): void {
  checkUrlHealth();
  setInterval(checkUrlHealth, CHECK_INTERVAL);
  logger.info({ interval: '24h' }, 'URL health checker started');
}
