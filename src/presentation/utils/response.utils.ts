import { Response } from 'express';
import { HTTP_STATUSES } from '../../shared/constants/http-statuses.js';
import type { EmailConfirmationResult, PasswordRecoveryResult } from '../../domain/types/auth.types.js';
import type { CreateUserResult } from '../../application/dto/user.dto.js';

export function sendErrorResponse(res: Response, result: EmailConfirmationResult | CreateUserResult | PasswordRecoveryResult): boolean {
  if (!result.success) {
    res.status(HTTP_STATUSES.BAD_REQUEST).send({
      errorsMessages: [
        {
          message: result.error.message,
          field: result.error.field,
        },
      ],
    });
    return true;
  }
  return false;
}
