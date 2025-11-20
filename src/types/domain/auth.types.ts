import type { JwtPayload } from 'jsonwebtoken';

export interface LoginDto {
  loginOrEmail: string;
  password: string;
}

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
}
