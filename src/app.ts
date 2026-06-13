import express from 'express';
import { router } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

const app = express();

app.set('trust proxy', 1);
app.use(express.json());

app.use(router);

app.use(notFound);
app.use(errorHandler);

export { app };
