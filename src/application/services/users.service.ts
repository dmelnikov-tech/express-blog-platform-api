import { randomUUID } from 'crypto';
import type { UserResponseDto, CreateUserDto, CreateUserResult } from '../dto/user.dto.js';
import type { UserPaginationSortParams, PaginatedSortedResponse } from '../../domain/types/pagination.types.js';
import type { User } from '../../domain/entities/user.entity.js';
import type { UserDocument } from '../../infrastructure/types/user.document.types.js';
import { usersRepository } from '../../infrastructure/database/repositories/users.repository.js';
import { hashPassword } from '../../infrastructure/external/password/password.provider.js';

export const usersService = {
  async getUsers(params: UserPaginationSortParams): Promise<PaginatedSortedResponse<UserResponseDto>> {
    const { items, totalCount } = await usersRepository.find(params);
    const users: UserResponseDto[] = this._mapUsersToResponseDto(items);

    const pagesCount = Math.ceil(totalCount / params.pageSize);

    return {
      pagesCount,
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
      items: users,
    };
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
};

