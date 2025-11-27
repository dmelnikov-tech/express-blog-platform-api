import { DeleteResult } from 'mongodb';
import { randomUUID } from 'crypto';
import type { LikesAggregation, UserStatusAggregation } from '../../types/likes-aggregation.types.js';
import type { PostLikeDocument } from '../../types/post-like.document.types.js';
import type { LikeStatus } from '../../../domain/types/like.types.js';
import type { PostLike } from '../../../domain/entities/post-like.entity.js';
import { getDatabase } from '../mongodb.js';
import { COLLECTIONS } from '../collections.js';

const getCollection = () => getDatabase().collection<PostLikeDocument>(COLLECTIONS.POST_LIKES);

export const postLikesRepository = {
  async getLikesAggregation(postsIds: string[]): Promise<LikesAggregation | {}> {
    if (!postsIds.length) {
      return {};
    }

    const collection = getCollection();

    const likeCond = { $cond: [{ $eq: ['$likeStatus', 'Like'] }, 1, 0] };
    const dislikeCond = { $cond: [{ $eq: ['$likeStatus', 'Dislike'] }, 1, 0] };

    const docs = await collection
      .aggregate([
        { $match: { postId: { $in: postsIds } } },
        {
          $group: {
            _id: '$postId',
            likesCount: { $sum: likeCond },
            dislikesCount: { $sum: dislikeCond },
          },
        },
      ])
      .toArray();

    return Object.fromEntries(
      docs.map(d => [
        d._id,
        {
          likesCount: d.likesCount,
          dislikesCount: d.dislikesCount,
        },
      ])
    );
  },

  async getUserStatuses(postIds: string[], userId: string): Promise<UserStatusAggregation> {
    if (!postIds.length) return {};

    const collection = getCollection();

    const userLikes = await collection
      .find({ postId: { $in: postIds }, userId }, { projection: { postId: 1, likeStatus: 1, _id: 0 } })
      .toArray();

    return Object.fromEntries(userLikes.map(like => [like.postId, like.likeStatus]));
  },

  async getUserStatus(postId: string, userId: string): Promise<LikeStatus> {
    const collection = getCollection();
    const like: PostLikeDocument | null = await collection.findOne({ postId, userId });
    return like?.likeStatus ?? 'None';
  },

  async updateLikeStatus(
    postId: string,
    userId: string,
    likeStatus: LikeStatus
  ): Promise<PostLikeDocument | null> {
    const collection = getCollection();
    const existingLike: PostLikeDocument | null = await collection.findOne({ postId, userId });

    if (likeStatus === 'None') {
      if (existingLike) {
        await collection.deleteOne({ postId, userId });
      }
      return null;
    }

    const now = new Date().toISOString();
    if (existingLike) {
      return await collection.findOneAndUpdate({ postId, userId }, { $set: { likeStatus, updatedAt: now } });
    }

    const newLike: PostLike = {
      id: randomUUID(),
      postId,
      userId,
      likeStatus,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(newLike as PostLikeDocument);
    return newLike as PostLikeDocument;
  },

  async deleteAll(): Promise<boolean> {
    const collection = getCollection();
    const result: DeleteResult = await collection.deleteMany({});
    return result.deletedCount > 0;
  },
};

