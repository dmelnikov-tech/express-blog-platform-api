import { DeleteResult } from 'mongodb';
import type { LikesAggregation, UserStatusAggregation } from '../../types/likes-aggregation.types.js';
import type { CommentLikeDocument } from '../../types/comment-like.document.types.js';
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

  async deleteAll(): Promise<boolean> {
    const collection = getCollection();
    const result: DeleteResult = await collection.deleteMany({});
    return result.deletedCount > 0;
  },
};
