import { randomUUID } from 'crypto';
import { usersRepository } from '../repositories/users.repository.js';
import { comparePassword, hashPassword } from '../utils/password.utils.js';
import type { LoginDto, EmailConfirmationResult } from '../types/domain/auth.types.js';
import type { CreateUserDto, CreateUserResult, User, UserResponseDto } from '../types/domain/user.types.js';
import type { UserDocument } from '../types/infrastructure/user.document.types.js';
import { generateAccessToken } from '../utils/jwt.utils.js';
import { emailService } from './email.service.js';

export const authService = {
  async login(data: LoginDto): Promise<string | null> {
    const { loginOrEmail, password } = data;

    const user: UserDocument | null = await usersRepository.findByLoginOrEmail(loginOrEmail, loginOrEmail); // дважды loginOrEmail передаем, чтобы не нарушать логику метода findByLoginOrEmail
    if (!user) {
      return null;
    }

    const isPasswordValid: boolean = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    const accessToken: string = generateAccessToken(user.id);
    return accessToken;
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
    const confirmationCodeExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 часа

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

    await emailService.sendConfirmationEmail(data.email, confirmationCode);
    const createdUser: UserDocument = await usersRepository.create(newUser);

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
    const confirmationCodeExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 часа
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

    // Проверяем срок действия кода
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
