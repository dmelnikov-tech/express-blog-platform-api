import { DeleteResult, SortDirection } from 'mongodb';
import type { Post } from '../../../domain/entities/post.entity.js';
import type { PostDocument } from '../../types/post.document.types.js';
import type { PaginationSortParams } from '../../../domain/types/pagination.types.js';
import type { UpdatePostDto } from '../../../application/dto/post.dto.js';
import { getDatabase } from '../mongodb.js';
import { COLLECTIONS } from '../collections.js';

const getCollection = () => getDatabase().collection<PostDocument>(COLLECTIONS.POSTS);

export const postsRepository = {
  async find(params: PaginationSortParams): Promise<{
    items: PostDocument[];
    totalCount: number;
  }> {
    const collection = getCollection();

    const sortDirection: SortDirection = params.sortDirection === 'asc' ? 1 : -1;
    const skip = (params.pageNumber - 1) * params.pageSize;

    const [items, totalCount] = await Promise.all([
      collection
        .find({})
        .sort({ [params.sortBy]: sortDirection })
        .skip(skip)
        .limit(params.pageSize)
        .toArray(),
      collection.countDocuments({}),
    ]);

    return { items, totalCount };
  },

  async findByBlogId(
    blogId: string,
    params: PaginationSortParams
  ): Promise<{
    items: PostDocument[];
    totalCount: number;
  }> {
    const collection = getCollection();

    const sortDirection: SortDirection = params.sortDirection === 'asc' ? 1 : -1;
    const skip = (params.pageNumber - 1) * params.pageSize;

    const filter = { blogId };

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

  async findById(id: string): Promise<PostDocument | null> {
    const collection = getCollection();
    return await collection.findOne({ id: id });
  },

  async create(post: Post): Promise<PostDocument> {
    const collection = getCollection();
    await collection.insertOne(post as PostDocument);
    return post as PostDocument;
  },

  async update(id: string, data: UpdatePostDto): Promise<PostDocument | null> {
    const collection = getCollection();
    return await collection.findOneAndUpdate({ id }, { $set: data });
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

