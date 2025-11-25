import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';

export const createRateLimitMiddleware = (endpoint: string) => {
  return rateLimit({
    windowMs: 10 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request): string => {
      const ip: string = req.ip || req.socket.remoteAddress || 'Unknown IP';
      const ipKey: string = ipKeyGenerator(ip);
      return `${endpoint}:${ipKey}`;
    },
  });
};
