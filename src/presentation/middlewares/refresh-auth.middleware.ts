import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUSES } from '../../shared/constants/http-statuses.js';
import { authService } from '../../application/services/auth.service.js';

export const refreshAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken: string | undefined = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED);
  }

  const validationResult = await authService.validateRefreshToken(refreshToken);

  if (!validationResult) {
    return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED);
  }

  req.userId = validationResult.userId;
  req.deviceId = validationResult.deviceId;

  return next();
};
