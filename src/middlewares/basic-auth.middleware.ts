import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUSES } from '../constants/http-statuses.js';

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader === 'Basic YWRtaW46cXdlcnR5') {
    return next();
  }

  res.sendStatus(HTTP_STATUSES.UNAUTHORIZED);
};
