import type { Request, Response } from 'express';
import { env } from '../lib/env.js';

let googleAuth: ((req: Request, res: Response) => void) | null = null;
let googleCallback: ((req: Request, res: Response) => void) | null = null;
let githubAuth: ((req: Request, res: Response) => void) | null = null;
let githubCallback: ((req: Request, res: Response) => void) | null = null;

async function initStrategies() {
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    const passport = (await import('../services/auth.js')).default;
    googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });
    googleCallback = passport.authenticate('google', {
      successRedirect: `${env.APP_URL}/auth/me`,
      failureRedirect: `${env.APP_URL}/auth/me?error=auth_failed`,
    });
  }
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    const passport = (await import('../services/auth.js')).default;
    githubAuth = passport.authenticate('github', { scope: ['user:email'] });
    githubCallback = passport.authenticate('github', {
      successRedirect: `${env.APP_URL}/auth/me`,
      failureRedirect: `${env.APP_URL}/auth/me?error=auth_failed`,
    });
  }
}

const initPromise = initStrategies();

const notConfigured = (provider: string) =>
  (req: Request, res: Response) => {
    res.status(501).json({ error: `${provider} OAuth is not configured`, providers: { google: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET), github: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) } });
  };

export async function googleAuthHandler(req: Request, res: Response): Promise<void> {
  await initPromise;
  if (googleAuth) return googleAuth(req, res);
  notConfigured('Google')(req, res);
}

export async function googleCallbackHandler(req: Request, res: Response): Promise<void> {
  await initPromise;
  if (googleCallback) return googleCallback(req, res);
  notConfigured('Google')(req, res);
}

export async function githubAuthHandler(req: Request, res: Response): Promise<void> {
  await initPromise;
  if (githubAuth) return githubAuth(req, res);
  notConfigured('GitHub')(req, res);
}

export async function githubCallbackHandler(req: Request, res: Response): Promise<void> {
  await initPromise;
  if (githubCallback) return githubCallback(req, res);
  notConfigured('GitHub')(req, res);
}

export function me(req: Request, res: Response): void {
  if (!req.isAuthenticated()) {
    res.json({
      authenticated: false,
      providers: {
        google: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
        github: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
      },
    });
    return;
  }

  const user = req.user as { id: string; email: string | null; name: string | null; avatarUrl: string | null };
  res.json({
    authenticated: true,
    providers: {
      google: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
      github: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    },
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
  });
}

export function logout(req: Request, res: Response): void {
  req.logout((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' });
      return;
    }
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });
}
