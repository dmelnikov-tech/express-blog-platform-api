import type { LikeStatus, NewestLike, NewestLikeWithUser } from '../../domain/types/like.types.js';

export interface LikesAggregation {
  [key: string]: { likesCount: number; dislikesCount: number };
}
export interface UserStatusAggregation {
  [key: string]: LikeStatus;
}

export interface NewestLikesAggregation {
  [key: string]: NewestLike[];
}

export interface NewestLikesWithUsersAggregation {
  [key: string]: NewestLikeWithUser[];
}
