import { DeleteResult, SortDirection } from 'mongodb';
import type { User } from '../types/domain/user.types.js';
import type { UserDocument } from '../types/infrastructure/user.document.types.js';
import type { UserFilter } from '../types/infrastructure/user-filter.types.js';
import type { UserPaginationSortParams } from '../types/domain/pagination.types.js';
import { getDatabase } from '../db/mongodb.js';
import { COLLECTIONS } from '../db/collections.js';

const getCollection = () => getDatabase().collection<UserDocument>(COLLECTIONS.USERS);

export const usersRepository = {
  async find(params: UserPaginationSortParams): Promise<{
    items: UserDocument[];
    totalCount: number;
  }> {
    const collection = getCollection();

    const filter: UserFilter = {};
    if (params.searchLoginTerm && params.searchEmailTerm) {
      // Оба параметра есть - используем $or
      filter.$or = [
        { login: { $regex: params.searchLoginTerm, $options: 'i' } },
        { email: { $regex: params.searchEmailTerm, $options: 'i' } },
      ];
    } else if (params.searchLoginTerm) {
      // Только login
      filter.login = { $regex: params.searchLoginTerm, $options: 'i' };
    } else if (params.searchEmailTerm) {
      // Только email
      filter.email = { $regex: params.searchEmailTerm, $options: 'i' };
    }

    const sortDirection: SortDirection = params.sortDirection === 'asc' ? 1 : -1;
    const skip = (params.pageNumber - 1) * params.pageSize;

    const [items, totalCount] = await Promise.all([
      collection
        .find(filter)
        .sort({ [params.sortBy]: sortDirection })
        .skip(skip)
        .limit(params.pageSize)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return { items, totalCount };
  },

  async findByLogin(login: string): Promise<UserDocument | null> {
    const collection = getCollection();
    return await collection.findOne({ login: login });
  },

  async findByEmail(email: string): Promise<UserDocument | null> {
    const collection = getCollection();
    return await collection.findOne({ email: email });
  },

  async findByLoginOrEmail(login: string, email: string): Promise<UserDocument | null> {
    const collection = getCollection();
    return await collection.findOne({
      $or: [{ login }, { email }],
    });
  },

  async create(user: User): Promise<UserDocument> {
    const collection = getCollection();
    await collection.insertOne(user as UserDocument); // as UserDocument чтоб typescript не ругался. _id добавляет mongodb при вставке
    return user as UserDocument; // MongoDB мутирует объект, добавляя _id, поэтому возвращаем как UserDocument
  },

  async delete(id: string): Promise<boolean> {
    const collection = getCollection();
    const result: DeleteResult = await collection.deleteOne({ id });
    return result.deletedCount > 0;
  },

  //метод используется только при тестировании в testing.routes
  async deleteAll(): Promise<boolean> {
    const collection = getCollection();
    const result: DeleteResult = await collection.deleteMany({});
    return result.deletedCount > 0;
  },
};
