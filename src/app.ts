import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { router } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    hsts: { maxAge: 31536000, preload: true },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        baseUri: ["'none'"],
      },
    },
    frameguard: { action: 'deny' },
  }),
);

app.use(cors({ methods: ['GET', 'POST'] }));
app.use(express.json({ limit: '10kb' }));

app.use(router);

app.use(notFound);
app.use(errorHandler);

export { app };
