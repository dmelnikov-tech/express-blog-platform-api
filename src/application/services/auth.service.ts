import { randomUUID } from 'crypto';
import { usersRepository } from '../../infrastructure/database/repositories/users.repository.js';
import { refreshTokensRepository } from '../../infrastructure/database/repositories/refresh-tokens.repository.js';
import { comparePassword, hashPassword } from '../../infrastructure/external/password/password.provider.js';
import type { LoginDto } from '../dto/auth.dto.js';
import type { CreateUserDto, CreateUserResult, UserResponseDto } from '../dto/user.dto.js';
import type { LoginResult, EmailConfirmationResult } from '../../domain/types/auth.types.js';
import type { User } from '../../domain/entities/user.entity.js';
import type { UserDocument } from '../../infrastructure/types/user.document.types.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../infrastructure/external/jwt/jwt.provider.js';
import { emailService } from '../../infrastructure/external/email/email.provider.js';

export const authService = {
  async login(data: LoginDto): Promise<LoginResult | null> {
    const { loginOrEmail, password } = data;

    const user: UserDocument | null = await usersRepository.findByLoginOrEmail(loginOrEmail, loginOrEmail);
    if (!user) {
      return null;
    }

    const isPasswordValid: boolean = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    const accessToken: string = generateAccessToken(user.id);
    const refreshToken: string = generateRefreshToken(user.id);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await refreshTokensRepository.create({
      userId: user.id,
      token: refreshToken,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    return {
      accessToken,
      refreshToken,
    };
  },

  async refreshToken(token: string): Promise<LoginResult | null> {
    try {
      const storedToken = await refreshTokensRepository.findByToken(token);
      if (!storedToken) {
        return null;
      }

      const expiresAt = new Date(storedToken.expiresAt);
      const now = new Date();
      if (now > expiresAt) {
        await refreshTokensRepository.deleteByToken(token);
        return null;
      }

      const payload = verifyRefreshToken(token);

      await refreshTokensRepository.deleteByToken(token);

      const accessToken: string = generateAccessToken(payload.userId);
      const refreshToken: string = generateRefreshToken(payload.userId);

      const newExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      await refreshTokensRepository.create({
        userId: payload.userId,
        token: refreshToken,
        createdAt: now.toISOString(),
        expiresAt: newExpiresAt.toISOString(),
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      await refreshTokensRepository.deleteByToken(token);
      return null;
    }
  },

  async logout(token: string): Promise<boolean> {
    const storedToken = await refreshTokensRepository.findByToken(token);
    if (!storedToken) {
      return false;
    }
    
    await refreshTokensRepository.deleteByToken(token);
    return true;
  },

  async registration(data: CreateUserDto): Promise<CreateUserResult> {
    const existingUser: UserDocument | null = await usersRepository.findByLoginOrEmail(data.login, data.email);
    if (existingUser) {
      if (existingUser.login === data.login) {
        return {
          success: false,
          error: {
            field: 'login',
            message: 'User with this login already exists',
          },
        };
      }
      if (existingUser.email === data.email) {
        return {
          success: false,
          error: {
            field: 'email',
            message: 'User with this email already exists',
          },
        };
      }
    }

    const passwordHash = await hashPassword(data.password);
    const confirmationCode = randomUUID();
    const confirmationCodeExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

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
          message: 'User with this email not found',
        },
      };
    }

    if (user.confirmationInfo.userIsConfirmed) {
      return {
        success: false,
        error: {
          field: 'email',
          message: 'User with this email already confirmed',
        },
      };
    }

    const newConfirmationCode = randomUUID();
    const confirmationCodeExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
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
          message: 'Invalid confirmation code',
        },
      };
    }

    if (user.confirmationInfo.confirmationCodeExpiredAt) {
      const codeExpiredAt = new Date(user.confirmationInfo.confirmationCodeExpiredAt);
      const now = new Date();

      if (now > codeExpiredAt) {
        return {
          success: false,
          error: {
            field: 'code',
            message: 'Confirmation code expired',
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

