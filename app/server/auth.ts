import type { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    user: { email: string; name: string; picture: string };
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
