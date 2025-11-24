import { DeleteResult } from 'mongodb';
import type { RefreshToken } from '../types/domain/refresh-token.types.js';
import type { RefreshTokenDocument } from '../types/infrastructure/refresh-token.document.types.js';
import { getDatabase } from '../db/mongodb.js';
import { COLLECTIONS } from '../db/collections.js';

const getCollection = () => getDatabase().collection<RefreshTokenDocument>(COLLECTIONS.REFRESH_TOKENS);

export const refreshTokensRepository = {
  async findByToken(token: string): Promise<RefreshTokenDocument | null> {
    const collection = getCollection();
    return await collection.findOne({ token });
  },

  async create(refreshToken: RefreshToken): Promise<RefreshTokenDocument> {
    const collection = getCollection();
    await collection.insertOne(refreshToken as RefreshTokenDocument); // as RefreshTokenDocument чтоб typescript не ругался. _id добавляет mongodb при вставке
    return refreshToken as RefreshTokenDocument; // MongoDB мутирует объект, добавляя _id, поэтому возвращаем как RefreshTokenDocument
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

  //метод используется только при тестировании в testing.routes
  async deleteAll(): Promise<boolean> {
    const collection = getCollection();
    const result: DeleteResult = await collection.deleteMany({});
    return result.deletedCount > 0;
  },
};
