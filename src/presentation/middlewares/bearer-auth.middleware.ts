import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUSES } from '../../shared/constants/http-statuses.js';
import { verifyAccessToken } from '../../infrastructure/external/jwt/jwt.provider.js';
import type { AuthTokenPayload } from '../../domain/types/auth.types.js';

export const bearerAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload: AuthTokenPayload = verifyAccessToken(token);

    req.userId = payload.userId;

    return next();
  } catch (error) {
    return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED);
  }
};

