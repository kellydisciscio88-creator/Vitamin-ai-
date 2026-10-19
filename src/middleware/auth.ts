import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getOrCreateUser } from '../db/users.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  userUid?: string;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    req.userUid = decodedToken.uid;
    if (decodedToken.email) {
      try {
        await getOrCreateUser(decodedToken.uid, decodedToken.email);
      } catch (err) {
        console.error('Failed to sync user in DB:', err);
      }
    }
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const resolveUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      req.user = decodedToken;
      req.userUid = decodedToken.uid;
      if (decodedToken.email) {
        try {
          await getOrCreateUser(decodedToken.uid, decodedToken.email);
        } catch (err) {
          console.error('Failed to sync user in DB:', err);
        }
      }
      return next();
    } catch (err) {
      console.warn('Optional token verification failed, falling back to client UID:', err);
    }
  }

  const clientUid = (req.headers['x-client-uid'] as string) || 'default-user';
  req.userUid = clientUid;
  next();
};
