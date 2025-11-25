import { randomUUID } from 'crypto';
import { usersRepository } from '../../infrastructure/database/repositories/users.repository.js';
import { devicesRepository } from '../../infrastructure/database/repositories/devices.repository.js';
import { comparePassword, hashPassword } from '../../infrastructure/external/password/password.provider.js';
import type { LoginDto } from '../dto/auth.dto.js';
import type { CreateUserDto, CreateUserResult, UserResponseDto } from '../dto/user.dto.js';
import type { LoginResult, EmailConfirmationResult, AuthTokenPayload } from '../../domain/types/auth.types.js';
import type { User } from '../../domain/entities/user.entity.js';
import type { UserDocument } from '../../infrastructure/types/user.document.types.js';
import type { DeviceDocument } from '../../infrastructure/types/device.document.types.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../infrastructure/external/jwt/jwt.provider.js';
import { emailService } from '../../infrastructure/external/email/email.provider.js';
import { REFRESH_TOKEN_EXPIRATION_MS, CONFIRMATION_CODE_EXPIRATION_MS } from '../../shared/constants/auth.constants.js';
import { USER_ERROR_MESSAGES } from '../../shared/constants/user-messages.constants.js';
import { checkUserUniqueness } from '../../shared/utils/user-uniqueness.utils.js';

export const authService = {
  async login(data: LoginDto, deviceTitle: string, ip: string): Promise<LoginResult | null> {
    const { loginOrEmail, password } = data;

    const user: UserDocument | null = await usersRepository.findByLoginOrEmail(loginOrEmail, loginOrEmail);
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

    await devicesRepository.create({
      deviceId,
      userId: user.id,
      title: deviceTitle,
      ip,
      refreshToken,
      lastActiveDate: now.toISOString(),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    const accessToken: string = generateAccessToken(user.id);

    return {
      accessToken,
      refreshToken,
    };
  },

  async refreshToken(token: string): Promise<LoginResult | null> {
    try {
      const payload: AuthTokenPayload = verifyRefreshToken(token);
      if (!payload.deviceId) {
        return null;
      }

      const device: DeviceDocument | null = await devicesRepository.findByDeviceId(payload.deviceId);
      if (!device || device.refreshToken !== token) {
        return null;
      }

      const expiresAt: Date = new Date(device.expiresAt);
      const now: Date = new Date();
      if (now > expiresAt) {
        await devicesRepository.deleteByDeviceId(payload.deviceId);
        return null;
      }

      const newRefreshToken: string = generateRefreshToken(payload.userId, payload.deviceId);
      const newExpiresAt: Date = new Date(now.getTime() + REFRESH_TOKEN_EXPIRATION_MS);
      await devicesRepository.updateRefreshToken(payload.deviceId, newRefreshToken, newExpiresAt.toISOString());

      const newAccessToken: string = generateAccessToken(payload.userId);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      return null;
    }
  },

  async logout(token: string): Promise<boolean> {
    try {
      const payload: AuthTokenPayload = verifyRefreshToken(token);
      if (!payload.deviceId) {
        return false;
      }

      const device: DeviceDocument | null = await devicesRepository.findByDeviceId(payload.deviceId);
      if (!device || device.refreshToken !== token) {
        return false;
      }

      await devicesRepository.deleteByDeviceId(payload.deviceId);
      return true;
    } catch (error) {
      return false;
    }
  },

  async registration(data: CreateUserDto): Promise<CreateUserResult> {
    const existingUser: UserDocument | null = await usersRepository.findByLoginOrEmail(data.login, data.email);
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
    };

    const createdUser: UserDocument = await usersRepository.create(newUser);
    await emailService.sendConfirmationEmail(data.email, confirmationCode);

    return {
      success: true,
      data: this._mapUserToResponseDto(createdUser),
    };
  },

  async resendConfirmationEmail(email: string): Promise<EmailConfirmationResult> {
    const user: UserDocument | null = await usersRepository.findByEmail(email);

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
    await usersRepository.updateConfirmationCode(email, newConfirmationCode, confirmationCodeExpiredAt);
    await emailService.sendConfirmationEmail(email, newConfirmationCode);

    return { success: true };
  },

  async confirmRegistration(confirmationCode: string): Promise<EmailConfirmationResult> {
    const user: UserDocument | null = await usersRepository.findByConfirmationCode(confirmationCode);

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

    await usersRepository.confirmUser(confirmationCode);
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
