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
    const accessToken: string | null = await authService.login({ loginOrEmail, password });

    if (!accessToken) {
      return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED);
    }

    res.status(HTTP_STATUSES.OK).send({
      accessToken,
    });
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

export default router;
