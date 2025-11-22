import { Router, Response, Request } from 'express';
import { authService } from '../services/auth.service.js';
import { HTTP_STATUSES } from '../constants/http-statuses.js';
import type { LoginDto, EmailConfirmationResult } from '../types/domain/auth.types.js';
import { RequestWithBody } from '../types/express-request.types.js';
import {
  loginValidationMiddleware,
  createUserValidationMiddleware,
  emailValidationMiddleware,
  confirmationCodeValidationMiddleware,
} from '../middlewares/validation.middleware.js';
import { bearerAuthMiddleware } from '../middlewares/bearer-auth.middleware.js';
import { usersService } from '../services/users.service.js';
import type { CreateUserDto, CreateUserResult } from '../types/domain/user.types.js';

const router = Router();

router.post(
  '/registration',
  createUserValidationMiddleware,
  async (req: RequestWithBody<CreateUserDto>, res: Response) => {
    try {
      const { login, password, email } = req.body;
      const createResult: CreateUserResult = await authService.registration({
        login,
        password,
        email,
      });

      if (!createResult.success) {
        return res.status(HTTP_STATUSES.BAD_REQUEST).send({
          errorsMessages: [
            {
              message: createResult.error.message,
              field: createResult.error.field,
            },
          ],
        });
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT);
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

router.post(
  '/registration-email-resending',
  emailValidationMiddleware,
  async (req: RequestWithBody<{ email: string }>, res: Response) => {
    try {
      const { email } = req.body;
      const result: EmailConfirmationResult = await authService.resendConfirmationEmail(email);

      if (!result.success) {
        return res.status(HTTP_STATUSES.BAD_REQUEST).send({
          errorsMessages: [
            {
              message: result.error.message,
              field: result.error.field,
            },
          ],
        });
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT);
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

router.post(
  '/registration-confirmation',
  confirmationCodeValidationMiddleware,
  async (req: RequestWithBody<{ code: string }>, res: Response) => {
    try {
      const { code } = req.body;
      const result: EmailConfirmationResult = await authService.confirmRegistration(code);

      if (!result.success) {
        return res.status(HTTP_STATUSES.BAD_REQUEST).send({
          errorsMessages: [
            {
              message: result.error.message,
              field: result.error.field,
            },
          ],
        });
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT);
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

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

router.get('/me', bearerAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const user = await usersService.getUserById(userId);

    if (!user) {
      return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED);
    }

    res.status(HTTP_STATUSES.OK).send({
      email: user.email,
      login: user.login,
      userId: user.id,
    });
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

export default router;
