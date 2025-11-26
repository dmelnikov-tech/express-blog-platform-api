import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../infrastructure/external/jwt/jwt.provider.js';
import type { AuthTokenPayload } from '../../domain/types/auth.types.js';

// мидлвара нужна, когда роут не защищен авторизацией, но accessToken может быть в заголовке и оттуда надо достать userId
export const optionalBearerAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader: string | undefined = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token: string = authHeader.split(' ')[1];

  try {
    const payload: AuthTokenPayload = verifyAccessToken(token);
    req.userId = payload.userId;
    return next();
  } catch (error) {
    return next();
  }
};
