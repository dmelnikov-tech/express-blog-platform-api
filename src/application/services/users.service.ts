import { randomUUID } from 'crypto';
import type { UserResponseDto, CreateUserDto, CreateUserResult } from '../dto/user.dto.js';
import type { UserPaginationSortParams, PaginatedSortedResponse } from '../../domain/types/pagination.types.js';
import type { User } from '../../domain/entities/user.entity.js';
import type { UserDocument } from '../../infrastructure/types/user.document.types.js';
import { usersRepository } from '../../infrastructure/database/repositories/users.repository.js';
import { hashPassword } from '../../infrastructure/external/password/password.provider.js';
import { createPaginatedResponse } from '../../shared/utils/pagination.utils.js';
import { checkUserUniqueness } from '../../shared/utils/user-uniqueness.utils.js';

export const usersService = {
  async getUsers(params: UserPaginationSortParams): Promise<PaginatedSortedResponse<UserResponseDto>> {
    const { items, totalCount }: { items: UserDocument[]; totalCount: number } = await usersRepository.find(params);
    const users: UserResponseDto[] = this._mapUsersToResponseDto(items);
    return createPaginatedResponse<UserResponseDto>(users, totalCount, params);
  },

  async getUserById(id: string): Promise<UserResponseDto | null> {
    const user: UserDocument | null = await usersRepository.findById(id);
    if (!user) {
      return null;
    }

    return this._mapUserToResponseDto(user);
  },

  async createUser(data: CreateUserDto): Promise<CreateUserResult> {
    const existingUser: UserDocument | null = await usersRepository.findByLoginOrEmail(data.login, data.email);
    const uniquenessError = checkUserUniqueness(existingUser, data.login, data.email);
    if (uniquenessError) {
      return uniquenessError;
    }

    const passwordHash = await hashPassword(data.password);

    const newUser: User = {
      id: randomUUID(),
      login: data.login,
      email: data.email,
      passwordHash,
      createdAt: new Date().toISOString(),
      confirmationInfo: {
        userIsConfirmed: true,
        confirmationCode: null,
        confirmationCodeExpiredAt: null,
      },
      recoveryInfo: {
        recoveryCode: null,
        recoveryCodeExpiredAt: null,
      },
    };

    const createdUser: UserDocument = await usersRepository.create(newUser);
    return {
      success: true,
      data: this._mapUserToResponseDto(createdUser),
    };
  },

  async deleteUser(id: string): Promise<boolean> {
    return await usersRepository.delete(id);
  },

  _mapUserToResponseDto(user: UserDocument): UserResponseDto {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  },

  _mapUsersToResponseDto(users: UserDocument[]): UserResponseDto[] {
    return users.map(user => this._mapUserToResponseDto(user));
  },

  // методы для auth.service
  async findUserByLoginOrEmailForAuth(loginOrEmail: string): Promise<UserDocument | null> {
    return await usersRepository.findByLoginOrEmail(loginOrEmail, loginOrEmail);
  },

  async findUserByEmailForAuth(email: string): Promise<UserDocument | null> {
    return await usersRepository.findByEmail(email);
  },

  async findUserByConfirmationCodeForAuth(confirmationCode: string): Promise<UserDocument | null> {
    return await usersRepository.findByConfirmationCode(confirmationCode);
  },

  async createUserForAuth(user: User): Promise<UserDocument> {
    return await usersRepository.create(user);
  },

  async updateConfirmationCodeForAuth(
    email: string,
    confirmationCode: string,
    confirmationCodeExpiredAt: string
  ): Promise<void> {
    await usersRepository.updateConfirmationCode(email, confirmationCode, confirmationCodeExpiredAt);
  },

  async confirmUserForAuth(confirmationCode: string): Promise<void> {
    await usersRepository.confirmUser(confirmationCode);
  },

  async findUserByRecoveryCodeForAuth(recoveryCode: string): Promise<UserDocument | null> {
    return await usersRepository.findByRecoveryCode(recoveryCode);
  },

  async updateRecoveryCodeForAuth(email: string, recoveryCode: string, recoveryCodeExpiredAt: string): Promise<void> {
    await usersRepository.updateRecoveryCode(email, recoveryCode, recoveryCodeExpiredAt);
  },

  async updatePasswordByRecoveryCodeForAuth(recoveryCode: string, passwordHash: string): Promise<void> {
    await usersRepository.updatePasswordByRecoveryCode(recoveryCode, passwordHash);
  },
};
