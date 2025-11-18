import { randomUUID } from 'crypto';
import type { User, UserResponseDto, CreateUserDto, CreateUserResult } from '../types/domain/user.types.js';
import type { UserDocument } from '../types/infrastructure/user.document.types.js';
import type { UserPaginationSortParams, PaginatedSortedResponse } from '../types/domain/pagination.types.js';
import { usersRepository } from '../repositories/users.repository.js';
import { hashPassword } from '../utils/password.utils.js';

export const usersService = {
  async getUsers(params: UserPaginationSortParams): Promise<PaginatedSortedResponse<UserResponseDto>> {
    const { items, totalCount } = await usersRepository.find(params);
    const users = this._mapUsersToResponseDto(items);

    const pagesCount = Math.ceil(totalCount / params.pageSize);

    return {
      pagesCount,
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
      items: users,
    };
  },

  async createUser(data: CreateUserDto): Promise<CreateUserResult> {
    const existingUserByLogin = await usersRepository.findByLogin(data.login);
    if (existingUserByLogin) {
      return {
        success: false,
        error: {
          field: 'login',
          message: 'login must be unique',
        },
      };
    }

    const existingUserByEmail = await usersRepository.findByEmail(data.email);
    if (existingUserByEmail) {
      return {
        success: false,
        error: {
          field: 'email',
          message: 'email must be unique',
        },
      };
    }

    const passwordHash = await hashPassword(data.password);

    const newUser: User = {
      id: randomUUID(),
      login: data.login,
      email: data.email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    const createdUser = await usersRepository.create(newUser);
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
