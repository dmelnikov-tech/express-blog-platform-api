import type { JwtPayload } from 'jsonwebtoken';

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
}

export type EmailConfirmationResult =
  | { success: true }
  | { success: false; error: { field: string; message: string } };

