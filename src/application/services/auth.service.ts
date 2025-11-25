import { randomUUID } from 'crypto';
import { usersService } from './users.service.js';
import { devicesService } from './devices.service.js';
import { comparePassword, hashPassword } from '../../infrastructure/external/password/password.provider.js';
import type { LoginDto } from '../dto/auth.dto.js';
import type { CreateUserDto, CreateUserResult, UserResponseDto } from '../dto/user.dto.js';
import type { LoginResult, EmailConfirmationResult, AuthTokenPayload, PasswordRecoveryResult } from '../../domain/types/auth.types.js';
import type { User } from '../../domain/entities/user.entity.js';
import type { UserDocument } from '../../infrastructure/types/user.document.types.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../infrastructure/external/jwt/jwt.provider.js';
import { emailService } from '../../infrastructure/external/email/email.provider.js';
import {
  REFRESH_TOKEN_EXPIRATION_MS,
  CONFIRMATION_CODE_EXPIRATION_MS,
  RECOVERY_CODE_EXPIRATION_MS,
} from '../../shared/constants/auth.constants.js';
import { USER_ERROR_MESSAGES } from '../../shared/constants/user-messages.constants.js';
import { checkUserUniqueness } from '../../shared/utils/user-uniqueness.utils.js';

export const authService = {
  async login(data: LoginDto, deviceTitle: string, ip: string): Promise<LoginResult | null> {
    const { loginOrEmail, password } = data;

    const user: UserDocument | null = await usersService.findUserByLoginOrEmailForAuth(loginOrEmail);
    if (!user) {
      return null;
    }

    const isPasswordValid: boolean = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    const deviceId: string = randomUUID();
    const now: Date = new Date();
    const expiresAt: Date = new Date(now.getTime() + REFRESH_TOKEN_EXPIRATION_MS);
    const refreshToken: string = generateRefreshToken(user.id, deviceId);

    await devicesService.createDeviceForAuth(deviceId, user.id, deviceTitle, ip, refreshToken, expiresAt.toISOString());

    const accessToken: string = generateAccessToken(user.id);

    return {
      accessToken,
      refreshToken,
    };
  },

  async refreshToken(deviceId: string, userId: string): Promise<LoginResult | null> {
    try {
      const device = await devicesService.getDeviceForRefresh(deviceId);
      if (!device) {
        return null;
      }

      const expiresAt: Date = new Date(device.expiresAt);
      const now: Date = new Date();
      if (now > expiresAt) {
        await devicesService.deleteDeviceForLogout(deviceId);
        return null;
      }

      const newRefreshToken: string = generateRefreshToken(userId, deviceId);
      const newExpiresAt: Date = new Date(now.getTime() + REFRESH_TOKEN_EXPIRATION_MS);
      await devicesService.updateDeviceRefreshToken(deviceId, newRefreshToken, newExpiresAt.toISOString());

      const newAccessToken: string = generateAccessToken(userId);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      return null;
    }
  },

  async logout(deviceId: string): Promise<boolean> {
    try {
      const deletedResult: boolean = await devicesService.deleteDeviceForLogout(deviceId);
      return deletedResult;
    } catch (error) {
      return false;
    }
  },

  async registration(data: CreateUserDto): Promise<CreateUserResult> {
    const existingUser: UserDocument | null = await usersService.findUserByLoginOrEmailForAuth(data.login);
    const uniquenessError = checkUserUniqueness(existingUser, data.login, data.email);
    if (uniquenessError) {
      return uniquenessError;
    }

    const passwordHash: string = await hashPassword(data.password);
    const confirmationCode: string = randomUUID();
    const confirmationCodeExpiredAt: string = new Date(Date.now() + CONFIRMATION_CODE_EXPIRATION_MS).toISOString();

    const newUser: User = {
      id: randomUUID(),
      login: data.login,
      email: data.email,
      passwordHash,
      createdAt: new Date().toISOString(),
      confirmationInfo: {
        userIsConfirmed: false,
        confirmationCode,
        confirmationCodeExpiredAt,
      },
      recoveryInfo: {
        recoveryCode: null,
        recoveryCodeExpiredAt: null,
      },
    };

    const createdUser: UserDocument = await usersService.createUserForAuth(newUser);
    await emailService.sendConfirmationEmail(data.email, confirmationCode);

    return {
      success: true,
      data: this._mapUserToResponseDto(createdUser),
    };
  },

  async resendConfirmationEmail(email: string): Promise<EmailConfirmationResult> {
    const user: UserDocument | null = await usersService.findUserByEmailForAuth(email);

    if (!user) {
      return {
        success: false,
        error: {
          field: 'email',
          message: USER_ERROR_MESSAGES.EMAIL_NOT_FOUND,
        },
      };
    }

    if (user.confirmationInfo.userIsConfirmed) {
      return {
        success: false,
        error: {
          field: 'email',
          message: USER_ERROR_MESSAGES.EMAIL_ALREADY_CONFIRMED,
        },
      };
    }

    const newConfirmationCode: string = randomUUID();
    const confirmationCodeExpiredAt: string = new Date(Date.now() + CONFIRMATION_CODE_EXPIRATION_MS).toISOString();
    await usersService.updateConfirmationCodeForAuth(email, newConfirmationCode, confirmationCodeExpiredAt);
    await emailService.sendConfirmationEmail(email, newConfirmationCode);

    return { success: true };
  },

  async confirmRegistration(confirmationCode: string): Promise<EmailConfirmationResult> {
    const user: UserDocument | null = await usersService.findUserByConfirmationCodeForAuth(confirmationCode);

    if (!user) {
      return {
        success: false,
        error: {
          field: 'code',
          message: USER_ERROR_MESSAGES.INVALID_CONFIRMATION_CODE,
        },
      };
    }

    if (user.confirmationInfo.confirmationCodeExpiredAt) {
      const codeExpiredAt: Date = new Date(user.confirmationInfo.confirmationCodeExpiredAt);
      const now: Date = new Date();

      if (now > codeExpiredAt) {
        return {
          success: false,
          error: {
            field: 'code',
            message: USER_ERROR_MESSAGES.CONFIRMATION_CODE_EXPIRED,
          },
        };
      }
    }

    await usersService.confirmUserForAuth(confirmationCode);
    return { success: true };
  },

  // метод для refresh-auth.middleware
  async validateRefreshToken(token: string): Promise<{ userId: string; deviceId: string } | null> {
    try {
      const payload: AuthTokenPayload = verifyRefreshToken(token);
      if (!payload.deviceId) {
        return null;
      }

      const isValidToken: boolean = await devicesService.validateDeviceForAuth(payload.deviceId, token);
      if (!isValidToken) {
        return null;
      }

      return {
        userId: payload.userId,
        deviceId: payload.deviceId,
      };
    } catch (error) {
      return null;
    }
  },

  async passwordRecovery(email: string): Promise<void> {
    const user: UserDocument | null = await usersService.findUserByEmailForAuth(email);

    if (!user) {
      return;
    }

    const recoveryCode: string = randomUUID();
    const recoveryCodeExpiredAt: string = new Date(Date.now() + RECOVERY_CODE_EXPIRATION_MS).toISOString();
    await usersService.updateRecoveryCodeForAuth(email, recoveryCode, recoveryCodeExpiredAt);
    await emailService.sendPasswordRecoveryEmail(email, recoveryCode);
  },

  async setNewPassword(recoveryCode: string, newPassword: string): Promise<PasswordRecoveryResult> {
    const user: UserDocument | null = await usersService.findUserByRecoveryCodeForAuth(recoveryCode);

    if (!user) {
      return {
        success: false,
        error: {
          field: 'recoveryCode',
          message: USER_ERROR_MESSAGES.INVALID_RECOVERY_CODE,
        },
      };
    }

    if (user.recoveryInfo.recoveryCodeExpiredAt) {
      const codeExpiredAt: Date = new Date(user.recoveryInfo.recoveryCodeExpiredAt);
      const now: Date = new Date();

      if (now > codeExpiredAt) {
        return {
          success: false,
          error: {
            field: 'recoveryCode',
            message: USER_ERROR_MESSAGES.RECOVERY_CODE_EXPIRED,
          },
        };
      }
    }

    const passwordHash: string = await hashPassword(newPassword);
    await usersService.updatePasswordByRecoveryCodeForAuth(recoveryCode, passwordHash);

    return { success: true };
  },

  _mapUserToResponseDto(user: UserDocument): UserResponseDto {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  },
};
