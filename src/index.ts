import './lib/env.js';
import { app } from './app.js';
import { logger } from './lib/logger.js';

if (!process.env.VITEST) {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Server started');
  });
}
