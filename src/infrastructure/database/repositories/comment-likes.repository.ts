import { DeleteResult } from 'mongodb';
import { randomUUID } from 'crypto';
import type { LikesAggregation, UserStatusAggregation } from '../../types/likes-aggregation.types.js';
import type { CommentLikeDocument } from '../../types/comment-like.document.types.js';
import type { LikeStatus } from '../../../domain/types/like.types.js';
import type { CommentLike } from '../../../domain/entities/comment-like.entity.js';
import { getDatabase } from '../mongodb.js';
import { COLLECTIONS } from '../collections.js';

const getCollection = () => getDatabase().collection<CommentLikeDocument>(COLLECTIONS.COMMENT_LIKES);

export const commentLikesRepository = {
  async getLikesAggregation(commentIds: string[]): Promise<LikesAggregation | {}> {
    if (!commentIds.length) {
      return {};
    }

    const collection = getCollection();

    const likeCond = { $cond: [{ $eq: ['$likeStatus', 'Like'] }, 1, 0] };
    const dislikeCond = { $cond: [{ $eq: ['$likeStatus', 'Dislike'] }, 1, 0] };

    const docs = await collection
      .aggregate([
        { $match: { commentId: { $in: commentIds } } },
        {
          $group: {
            _id: '$commentId',
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

  async getUserStatuses(commentIds: string[], userId: string): Promise<UserStatusAggregation> {
    if (!commentIds.length) return {};

    const collection = getCollection();

    const userLikes = await collection
      .find({ commentId: { $in: commentIds }, userId }, { projection: { commentId: 1, likeStatus: 1, _id: 0 } })
      .toArray();

    return Object.fromEntries(userLikes.map(like => [like.commentId, like.likeStatus]));
  },

  async getUserStatus(commentId: string, userId: string): Promise<LikeStatus> {
    const collection = getCollection();
    const like: CommentLikeDocument | null = await collection.findOne({ commentId, userId });
    return like?.likeStatus ?? 'None';
  },

  async updateLikeStatus(
    commentId: string,
    userId: string,
    likeStatus: LikeStatus
  ): Promise<CommentLikeDocument | null> {
    const collection = getCollection();
    const existingLike: CommentLikeDocument | null = await collection.findOne({ commentId, userId });

    if (likeStatus === 'None') {
      if (existingLike) {
        await collection.deleteOne({ commentId, userId });
      }
      return null;
    }

    const now = new Date().toISOString();
    if (existingLike) {
      return await collection.findOneAndUpdate({ commentId, userId }, { $set: { likeStatus, updatedAt: now } });
    }

    const newLike: CommentLike = {
      id: randomUUID(),
      commentId,
      userId,
      likeStatus,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(newLike as CommentLikeDocument);
    return newLike as CommentLikeDocument;
  },

  async deleteAll(): Promise<boolean> {
    const collection = getCollection();
    const result: DeleteResult = await collection.deleteMany({});
    return result.deletedCount > 0;
  },
};
