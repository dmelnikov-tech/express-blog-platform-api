import { DeleteResult, SortDirection } from 'mongodb';
import type { Blog } from '../../../domain/entities/blog.entity.js';
import type { BlogDocument } from '../../types/blog.document.types.js';
import type { BlogFilter } from '../../types/blog-filter.types.js';
import type { BlogPaginationSortParams } from '../../../domain/types/pagination.types.js';
import type { UpdateBlogDto } from '../../../application/dto/blog.dto.js';
import { getDatabase } from '../mongodb.js';
import { COLLECTIONS } from '../collections.js';

const getCollection = () => getDatabase().collection<BlogDocument>(COLLECTIONS.BLOGS);

export const blogsRepository = {
  async find(params: BlogPaginationSortParams): Promise<{
    items: BlogDocument[];
    totalCount: number;
  }> {
    const collection = getCollection();

    const filter: BlogFilter = params.searchNameTerm ? { name: { $regex: params.searchNameTerm, $options: 'i' } } : {};

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

  async findById(id: string): Promise<BlogDocument | null> {
    const collection = getCollection();
    return await collection.findOne({ id: id });
  },

  async create(blog: Blog): Promise<BlogDocument> {
    const collection = getCollection();
    await collection.insertOne(blog as BlogDocument);
    return blog as BlogDocument;
  },

  async update(id: string, data: UpdateBlogDto): Promise<BlogDocument | null> {
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

