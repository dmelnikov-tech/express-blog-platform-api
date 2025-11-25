import type { JwtPayload } from 'jsonwebtoken';

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
  deviceId: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
}

export type EmailConfirmationResult = { success: true } | { success: false; error: { field: string; message: string } };

export type PasswordRecoveryResult = { success: true } | { success: false; error: { field: string; message: string } };