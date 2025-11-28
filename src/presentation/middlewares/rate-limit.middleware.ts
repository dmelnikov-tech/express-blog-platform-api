import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';

export const createRateLimitMiddleware = (endpoint: string) => {
  return rateLimit({
    windowMs: 10 * 1000, // 10 секунд
    max: 5, // Максимум 5 запросов на указанный endpoint в рамках windowMs
    standardHeaders: true,
    legacyHeaders: false, 

    keyGenerator: (req: Request): string => {
      const ip: string = req.ip || req.socket.remoteAddress || 'Unknown IP';
      // Превращаем IP в хэш/ключ через кастомную функцию, чтобы скрыть реальный IP и обеспечить одинаковый формат ключей.
      const ipKey: string = ipKeyGenerator(ip);
      // Создаём уникальный ключ для rate limiting: он связывает конкретный endpoint с пользователем по его ipKey.
      // Благодаря этому разные endpoints имеют отдельные лимиты.
      return `${endpoint}:${ipKey}`;
    },
  });
};
