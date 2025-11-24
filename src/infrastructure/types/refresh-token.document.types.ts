import type { RefreshToken } from '../../domain/entities/refresh-token.entity.js';
import type { ObjectId } from 'mongodb';

export type RefreshTokenDocument = RefreshToken & { _id: ObjectId };

