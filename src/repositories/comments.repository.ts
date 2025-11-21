import { SortDirection } from 'mongodb';
import type { Comment } from '../types/domain/comment.types.js';
import type { CommentDocument } from '../types/infrastructure/comment.document.types.js';
import type { PaginationSortParams } from '../types/domain/pagination.types.js';
import { getDatabase } from '../db/mongodb.js';
import { COLLECTIONS } from '../db/collections.js';

const getCollection = () => getDatabase().collection<CommentDocument>(COLLECTIONS.COMMENTS);

export const commentsRepository = {
  async findByPostId(
    postId: string,
    params: PaginationSortParams
  ): Promise<{
    items: CommentDocument[];
    totalCount: number;
  }> {
    const collection = getCollection();

    const sortDirection: SortDirection = params.sortDirection === 'asc' ? 1 : -1;
    const skip = (params.pageNumber - 1) * params.pageSize;

    const filter = { postId };

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

  async create(comment: Comment): Promise<CommentDocument> {
    const collection = getCollection();
    await collection.insertOne(comment as CommentDocument); // as CommentDocument чтоб typescript не ругался. _id добавляет mongodb при вставке
    return comment as CommentDocument; // MongoDB мутирует объект, добавляя _id, поэтому возвращаем как CommentDocument
  },
};
