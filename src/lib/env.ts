import { z } from 'zod';
import { logger } from './logger.js';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SESSION_SECRET: z.string().min(16).default('change-me-to-a-random-string'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  APP_URL: z.string().default('http://localhost:3000'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    logger.fatal({ issues: result.error.issues }, 'Invalid environment variables');
    process.exit(1);
  }
  logger.info({ ...result.data, SESSION_SECRET: '***' }, 'Environment validated');
  return result.data;
}

export const env = process.env.VITEST
  ? ({} as ReturnType<typeof validateEnv>)
  : validateEnv();
