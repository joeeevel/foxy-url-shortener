import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { router } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    hsts: { maxAge: 31536000, preload: true },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'https:'],
        connectSrc: ["'self'"],
      },
    },
    frameguard: { action: 'deny' },
  }),
);

app.use(cors({ methods: ['GET', 'POST', 'DELETE'] }));
app.use(express.json({ limit: '10kb' }));

app.use(express.static(resolve(__dirname, '..', 'public')));

app.use(router);

app.use(notFound);
app.use(errorHandler);

export { app };
