import { DeleteResult } from "mongodb";
import type { Post, UpdatePostDto } from "../types/domain/post.types.js";
import type { PostDocument } from "../types/infrastructure/post.document.types.js";
import type { PaginationSortParams } from "../types/domain/pagination.types.js";
import { getDatabase } from "../db/mongodb.js";
import { COLLECTIONS } from "../db/collections.js";

const getCollection = () =>
  getDatabase().collection<PostDocument>(COLLECTIONS.POSTS);

export const postsRepository = {
  async find(params: PaginationSortParams): Promise<{
    items: PostDocument[];
    totalCount: number;
  }> {
    const collection = getCollection();

    const skip = (params.pageNumber - 1) * params.pageSize;

    const [items, totalCount] = await Promise.all([
      collection
        .find({})
        .sort({ [params.sortBy]: params.sortDirection })
        .skip(skip)
        .limit(params.pageSize)
        .toArray(),
      collection.countDocuments({}),
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
