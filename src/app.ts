import express from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import passport from './services/auth.js';
import { router } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { env } from './lib/env.js';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(express.json({ limit: '10kb' }));

if (!process.env.VITEST) {
  const PgStore = pgSession(session);
  app.use(
    session({
      store: new PgStore({
        conString: env.DATABASE_URL,
        createTableIfMissing: true,
      }),
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
} else {
  app.use(
    session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
}

app.use(router);

app.use(notFound);
app.use(errorHandler);

export { app };
