import jwt from 'jsonwebtoken';
import 'dotenv/config';
import type { AuthTokenPayload } from '../../../domain/types/auth.types.js';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_EXPIRES_IN = '1h';

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = '7d';

export const generateAccessToken = (userId: string): string => {
  const payload = {
    userId,
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const generateRefreshToken = (userId: string): string => {
  const payload = {
    userId,
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET!, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, JWT_ACCESS_SECRET!) as AuthTokenPayload;
};

export const verifyRefreshToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET!) as AuthTokenPayload;
};

