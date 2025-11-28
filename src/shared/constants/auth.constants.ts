import type { CookieOptions } from 'express';

export const REFRESH_TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 дней

export const CONFIRMATION_CODE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 часа

export const RECOVERY_CODE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 часа

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: REFRESH_TOKEN_EXPIRATION_MS,
};
