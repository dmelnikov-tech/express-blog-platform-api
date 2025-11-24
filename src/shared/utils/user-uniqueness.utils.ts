import type { UserDocument } from '../../infrastructure/types/user.document.types.js';
import type { CreateUserResult } from '../../application/dto/user.dto.js';
import { USER_ERROR_MESSAGES } from '../constants/user-messages.constants.js';

export function checkUserUniqueness(
  existingUser: UserDocument | null,
  login: string,
  email: string
): CreateUserResult | null {
  if (!existingUser) {
    return null;
  }

  if (existingUser.login === login) {
    return {
      success: false,
      error: {
        field: 'login',
        message: USER_ERROR_MESSAGES.LOGIN_ALREADY_EXISTS,
      },
    };
  }

  if (existingUser.email === email) {
    return {
      success: false,
      error: {
        field: 'email',
        message: USER_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      },
    };
  }

  return null;
}
