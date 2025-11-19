import { Router, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { HTTP_STATUSES } from '../constants/http-statuses.js';
import type { LoginDto } from '../types/domain/auth.types.js';
import { RequestWithBody } from '../types/express-request.types.js';
import { loginValidationMiddleware } from '../middlewares/validation.middleware.js';

const router = Router();

router.post('/login', loginValidationMiddleware, async (req: RequestWithBody<LoginDto>, res: Response) => {
  try {
    const { loginOrEmail, password } = req.body;
    const isValid: boolean = await authService.login({ loginOrEmail, password });

    if (!isValid) {
      return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED);
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTENT);
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

export default router;
