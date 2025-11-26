import type { CommentLikeStatus } from '../../domain/types/comment.types.js';

export interface LikesAggregation {
  [key: string]: { likesCount: number; dislikesCount: number };
}
export interface UserStatusAggregation {
  [key: string]: CommentLikeStatus;
}
