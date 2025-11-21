import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUSES } from '../constants/http-statuses.js';
import { verifyAccessToken } from '../utils/jwt.utils.js';
import type { AuthTokenPayload } from '../types/domain/auth.types.js';

export const bearerAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload: AuthTokenPayload = verifyAccessToken(token);

    // сохраняем userId из токена в запрос для дальнейшего использования в хендлерах
    req.userId = payload.userId;

    return next();
  } catch (error) {
    return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED);
  }
};
