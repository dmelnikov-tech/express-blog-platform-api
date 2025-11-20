import { usersRepository } from '../repositories/users.repository.js';
import { comparePassword } from '../utils/password.utils.js';
import type { LoginDto } from '../types/domain/auth.types.js';
import { UserDocument } from '../types/infrastructure/user.document.types.js';
import { generateAccessToken } from '../utils/jwt.utils.js';

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
};
