import { DeleteResult, SortDirection } from 'mongodb';
import type { Comment } from '../../../domain/entities/comment.entity.js';
import type { CommentDocument } from '../../types/comment.document.types.js';
import type { PaginationSortParams } from '../../../domain/types/pagination.types.js';
import { getDatabase } from '../mongodb.js';
import { COLLECTIONS } from '../collections.js';

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
    const skip: number = (params.pageNumber - 1) * params.pageSize;

    const filter: { postId: string } = { postId };

    const [items, totalCount]: [CommentDocument[], number] = await Promise.all([
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

  async findById(id: string): Promise<CommentDocument | null> {
    const collection = getCollection();
    return await collection.findOne({ id });
  },

  async update(id: string, data: { content: string }): Promise<CommentDocument | null> {
    const collection = getCollection();
    return await collection.findOneAndUpdate({ id }, { $set: data });
  },

  async create(comment: Comment): Promise<CommentDocument> {
    const collection = getCollection();
    await collection.insertOne(comment as CommentDocument);
    return comment as CommentDocument;
  },

  async delete(id: string): Promise<boolean> {
    const collection = getCollection();
    const result: DeleteResult = await collection.deleteOne({ id });
    return result.deletedCount > 0;
  },

  async deleteAll(): Promise<boolean> {
    const collection = getCollection();
    const result: DeleteResult = await collection.deleteMany({});
    return result.deletedCount > 0;
  },
};

