import { DeleteResult } from 'mongodb';
import type { RefreshToken } from '../../../domain/entities/refresh-token.entity.js';
import type { RefreshTokenDocument } from '../../types/refresh-token.document.types.js';
import { getDatabase } from '../mongodb.js';
import { COLLECTIONS } from '../collections.js';

const getCollection = () => getDatabase().collection<RefreshTokenDocument>(COLLECTIONS.REFRESH_TOKENS);

export const refreshTokensRepository = {
  async findByToken(token: string): Promise<RefreshTokenDocument | null> {
    const collection = getCollection();
    return await collection.findOne({ token });
  },

  async create(refreshToken: RefreshToken): Promise<RefreshTokenDocument> {
    const collection = getCollection();
    await collection.insertOne(refreshToken as RefreshTokenDocument);
    return refreshToken as RefreshTokenDocument;
  },

  async deleteByToken(token: string): Promise<boolean> {
    const collection = getCollection();
    const result = await collection.deleteOne({ token });
    return result.deletedCount > 0;
  },

  async deleteByUserId(userId: string): Promise<number> {
    const collection = getCollection();
    const result = await collection.deleteMany({ userId });
    return result.deletedCount;
  },

  async deleteExpiredTokens(): Promise<number> {
    const collection = getCollection();
    const now = new Date().toISOString();
    const result = await collection.deleteMany({ expiresAt: { $lt: now } });
    return result.deletedCount;
  },

  async deleteAll(): Promise<boolean> {
    const collection = getCollection();
    const result: DeleteResult = await collection.deleteMany({});
    return result.deletedCount > 0;
  },
};

