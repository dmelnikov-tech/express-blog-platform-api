import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUSES } from '../../shared/constants/http-statuses.js';

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader: string | undefined = req.headers.authorization;
  const basicAuthSecret: string = process.env.BASIC_AUTH_SECRET!;
  
  if (authHeader === `Basic ${basicAuthSecret}`) {
    return next();
  }

  res.sendStatus(HTTP_STATUSES.UNAUTHORIZED);
};

