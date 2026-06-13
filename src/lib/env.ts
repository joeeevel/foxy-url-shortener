import { z } from 'zod';
import { logger } from './logger.js';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().optional(),
  API_KEY: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    logger.fatal({ issues: result.error.issues }, 'Invalid environment variables');
    process.exit(1);
  }

  logger.info({ ...result.data }, 'Environment validated');
  return result.data;
}

export const env = validateEnv();
