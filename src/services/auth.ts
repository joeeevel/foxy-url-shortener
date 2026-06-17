import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import type { Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import type { Profile as GitHubProfile } from 'passport-github2';
import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as { id: string }).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    if (!prisma.user) return done(null, { id, email: null, name: null, avatarUrl: null });
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

type VerifyDone = (err: Error | null, user?: Express.User | null) => void;

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      // @ts-ignore - passport-google-oauth20 types are complex; runtime works
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${env.APP_URL}/auth/google/callback`,
      },
      async (_accessToken: string, _refreshToken: string, profile: GoogleProfile, done: VerifyDone) => {
        try {
          const email = profile.emails?.[0]?.value ?? null;
          let user = email ? await prisma.user.findFirst({ where: { email } }) : null;
          if (!user) user = await prisma.user.findUnique({ where: { googleId: profile.id } });
          if (user) {
            const updated = await prisma.user.update({ where: { id: user.id }, data: { googleId: profile.id, name: profile.displayName || user.name, avatarUrl: profile.photos?.[0]?.value || user.avatarUrl, email: email ?? user.email } });
            return done(null, updated);
          }
          const created = await prisma.user.create({ data: { googleId: profile.id, email, name: profile.displayName, avatarUrl: profile.photos?.[0]?.value ?? null } });
          logger.info({ id: created.id }, 'User created via Google');
          return done(null, created);
        } catch (err) { return done(err as Error, undefined); }
      },
    ),
  );
  logger.info('Google OAuth configured');
}

if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      // @ts-ignore - passport-github2 types are complex; runtime works
      {
        clientID: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL: `${env.APP_URL}/auth/github/callback`,
        scope: ['user:email'],
      },
      async (_accessToken: string, _refreshToken: string, profile: GitHubProfile, done: VerifyDone) => {
        try {
          const email = profile.emails?.[0]?.value ?? null;
          let user = email ? await prisma.user.findFirst({ where: { email } }) : null;
          if (!user) user = await prisma.user.findUnique({ where: { githubId: profile.id } });
          if (user) {
            const updated = await prisma.user.update({ where: { id: user.id }, data: { githubId: profile.id, name: profile.displayName || user.name, avatarUrl: profile.photos?.[0]?.value || user.avatarUrl, email: email ?? user.email } });
            return done(null, updated);
          }
          const created = await prisma.user.create({ data: { githubId: profile.id, email, name: profile.displayName, avatarUrl: profile.photos?.[0]?.value ?? null } });
          logger.info({ id: created.id }, 'User created via GitHub');
          return done(null, created);
        } catch (err) { return done(err as Error, undefined); }
      },
    ),
  );
  logger.info('GitHub OAuth configured');
}

export default passport;
