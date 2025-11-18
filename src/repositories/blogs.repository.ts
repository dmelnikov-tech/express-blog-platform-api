import { DeleteResult, SortDirection } from 'mongodb';
import type { Blog, UpdateBlogDto } from '../types/domain/blog.types.js';
import type { BlogDocument } from '../types/infrastructure/blog.document.types.js';
import type { BlogFilter } from '../types/infrastructure/blog-filter.types.js';
import type { PaginationSortParams } from '../types/domain/pagination.types.js';
import { getDatabase } from '../db/mongodb.js';
import { COLLECTIONS } from '../db/collections.js';

const getCollection = () => getDatabase().collection<BlogDocument>(COLLECTIONS.BLOGS);

export const blogsRepository = {
  async find(params: PaginationSortParams): Promise<{
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
    await collection.insertOne(blog as BlogDocument); // as BlogDocument чтоб typescript не ругался. _id добавляет mongodb при вставке
    return blog as BlogDocument; // MongoDB мутирует объект, добавляя _id, поэтому возвращаем как BlogDocument
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

  //метод используется только при тестировании в testing.routes
  async deleteAll(): Promise<boolean> {
    const collection = getCollection();
    const result: DeleteResult = await collection.deleteMany({});
    return result.deletedCount > 0;
  },
};
