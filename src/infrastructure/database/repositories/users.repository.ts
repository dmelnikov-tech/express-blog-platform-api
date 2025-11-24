import { DeleteResult, SortDirection, UpdateResult } from 'mongodb';
import type { User } from '../../../domain/entities/user.entity.js';
import type { UserDocument } from '../../types/user.document.types.js';
import type { UserFilter } from '../../types/user-filter.types.js';
import type { UserPaginationSortParams } from '../../../domain/types/pagination.types.js';
import { getDatabase } from '../mongodb.js';
import { COLLECTIONS } from '../collections.js';

const getCollection = () => getDatabase().collection<UserDocument>(COLLECTIONS.USERS);

export const usersRepository = {
  async find(params: UserPaginationSortParams): Promise<{
    items: UserDocument[];
    totalCount: number;
  }> {
    const collection = getCollection();

    const filter: UserFilter = {};
    if (params.searchLoginTerm && params.searchEmailTerm) {
      filter.$or = [
        { login: { $regex: params.searchLoginTerm, $options: 'i' } },
        { email: { $regex: params.searchEmailTerm, $options: 'i' } },
      ];
    } else if (params.searchLoginTerm) {
      filter.login = { $regex: params.searchLoginTerm, $options: 'i' };
    } else if (params.searchEmailTerm) {
      filter.email = { $regex: params.searchEmailTerm, $options: 'i' };
    }

    const sortDirection: SortDirection = params.sortDirection === 'asc' ? 1 : -1;
    const skip: number = (params.pageNumber - 1) * params.pageSize;

    const [items, totalCount]: [UserDocument[], number] = await Promise.all([
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

  async findByLoginOrEmail(login: string, email: string): Promise<UserDocument | null> {
    const collection = getCollection();
    return await collection.findOne({
      $or: [{ login }, { email }],
    });
  },

  async findById(id: string): Promise<UserDocument | null> {
    const collection = getCollection();
    return await collection.findOne({ id });
  },

  async create(user: User): Promise<UserDocument> {
    const collection = getCollection();
    await collection.insertOne(user as UserDocument);
    return user as UserDocument;
  },

  async delete(id: string): Promise<boolean> {
    const collection = getCollection();
    const result: DeleteResult = await collection.deleteOne({ id });
    return result.deletedCount > 0;
  },

  async findByEmail(email: string): Promise<UserDocument | null> {
    const collection = getCollection();
    return await collection.findOne({ email });
  },

  async findByConfirmationCode(confirmationCode: string): Promise<UserDocument | null> {
    const collection = getCollection();
    return await collection.findOne({ 'confirmationInfo.confirmationCode': confirmationCode });
  },

  async updateConfirmationCode(
    email: string,
    confirmationCode: string,
    confirmationCodeExpiredAt: string
  ): Promise<boolean> {
    const collection = getCollection();
    const result: UpdateResult = await collection.updateOne(
      { email },
      {
        $set: {
          'confirmationInfo.confirmationCode': confirmationCode,
          'confirmationInfo.confirmationCodeExpiredAt': confirmationCodeExpiredAt,
        },
      }
    );
    return result.modifiedCount > 0;
  },

  async confirmUser(confirmationCode: string): Promise<boolean> {
    const collection = getCollection();
    const result: UpdateResult = await collection.updateOne(
      { 'confirmationInfo.confirmationCode': confirmationCode },
      {
        $set: {
          'confirmationInfo.userIsConfirmed': true,
          'confirmationInfo.confirmationCode': null,
          'confirmationInfo.confirmationCodeExpiredAt': null,
        },
      }
    );
    return result.modifiedCount > 0;
  },

  async deleteAll(): Promise<boolean> {
    const collection = getCollection();
    const result: DeleteResult = await collection.deleteMany({});
    return result.deletedCount > 0;
  },
};

