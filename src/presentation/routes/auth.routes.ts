import { Router, Response, Request } from 'express';
import { authService } from '../../application/services/auth.service.js';
import { usersService } from '../../application/services/users.service.js';
import { HTTP_STATUSES } from '../../shared/constants/http-statuses.js';
import type { LoginDto } from '../../application/dto/auth.dto.js';
import type { EmailConfirmationResult, LoginResult } from '../../domain/types/auth.types.js';
import type { CreateUserDto, CreateUserResult, UserResponseDto } from '../../application/dto/user.dto.js';
import { RequestWithBody } from '../../shared/types/express-request.types.js';
import {
  loginValidationMiddleware,
  emailValidationMiddleware,
  confirmationCodeValidationMiddleware,
} from '../middlewares/validation/auth.validation.js';
import { createUserValidationMiddleware } from '../middlewares/validation/user.validation.js';
import { bearerAuthMiddleware } from '../middlewares/bearer-auth.middleware.js';
import { refreshAuthMiddleware } from '../middlewares/refresh-auth.middleware.js';
import { createRateLimitMiddleware } from '../middlewares/rate-limit.middleware.js';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '../utils/cookie.utils.js';
import { sendErrorResponse } from '../utils/response.utils.js';

const router = Router();

router.post(
  '/registration',
  createRateLimitMiddleware('/registration'),
  createUserValidationMiddleware,
  async (req: RequestWithBody<CreateUserDto>, res: Response) => {
    try {
      const { login, password, email }: CreateUserDto = req.body;
      const createResult: CreateUserResult = await authService.registration({
        login,
        password,
        email,
      });

      if (sendErrorResponse(res, createResult)) {
        return;
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT);
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

router.post(
  '/registration-email-resending',
  createRateLimitMiddleware('/registration-email-resending'),
  emailValidationMiddleware,
  async (req: RequestWithBody<{ email: string }>, res: Response) => {
    try {
      const { email }: { email: string } = req.body;
      const result: EmailConfirmationResult = await authService.resendConfirmationEmail(email);

      if (sendErrorResponse(res, result)) {
        return;
      }
      res.sendStatus(HTTP_STATUSES.NO_CONTENT);
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

router.post(
  '/registration-confirmation',
  createRateLimitMiddleware('/registration-confirmation'),
  confirmationCodeValidationMiddleware,
  async (req: RequestWithBody<{ code: string }>, res: Response) => {
    try {
      const { code }: { code: string } = req.body;
      const result: EmailConfirmationResult = await authService.confirmRegistration(code);

      if (sendErrorResponse(res, result)) {
        return;
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT);
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

router.post(
  '/login',
  createRateLimitMiddleware('/login'),
  loginValidationMiddleware,
  async (req: RequestWithBody<LoginDto>, res: Response) => {
    try {
      const { loginOrEmail, password }: LoginDto = req.body;
      const deviceTitle: string = req.headers['user-agent'] || 'Unknown device';
      const ip: string = req.ip || req.socket.remoteAddress || 'Unknown IP';
      const tokens: LoginResult | null = await authService.login({ loginOrEmail, password }, deviceTitle, ip);

      if (!tokens) {
        return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED);
      }

      res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      res.status(HTTP_STATUSES.OK).send({
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

router.post('/logout', refreshAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const deviceId: string = req.deviceId;
    const success: boolean = await authService.logout(deviceId);

    if (!success) {
      return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED);
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTENT);
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

router.post('/refresh-token', refreshAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const deviceId: string = req.deviceId;
    const userId: string = req.userId;
    const tokens: LoginResult | null = await authService.refreshToken(deviceId, userId);

    if (!tokens) {
      return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED);
    }

    res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    res.status(HTTP_STATUSES.OK).send({
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

router.get('/me', bearerAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId: string = req.userId;

    const user: UserResponseDto | null = await usersService.getUserById(userId);

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
