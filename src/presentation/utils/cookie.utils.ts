import type { CookieOptions } from 'express';
import { REFRESH_TOKEN_EXPIRATION_MS } from '../../shared/constants/auth.constants.js';

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: REFRESH_TOKEN_EXPIRATION_MS,
};
