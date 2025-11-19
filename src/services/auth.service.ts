import { usersRepository } from '../repositories/users.repository.js';
import { comparePassword } from '../utils/password.utils.js';
import type { LoginDto } from '../types/domain/auth.types.js';
import { UserDocument } from '../types/infrastructure/user.document.types.js';

export const authService = {
  async login(data: LoginDto): Promise<boolean> {
    const { loginOrEmail, password } = data;

    const user: UserDocument | null = await usersRepository.findByLoginOrEmail(loginOrEmail, loginOrEmail); // дважды loginOrEmail передаем, чтобы не нарушать логику метода findByLoginOrEmail
    if (!user) {
      return false;
    }

    const isPasswordValid: boolean = await comparePassword(password, user.passwordHash);
    return isPasswordValid;
  },
};
