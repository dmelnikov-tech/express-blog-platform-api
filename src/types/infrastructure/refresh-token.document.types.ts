import type { RefreshToken } from '../domain/refresh-token.types.js';
import type { ObjectId } from 'mongodb';

export type RefreshTokenDocument = RefreshToken & { _id: ObjectId };

