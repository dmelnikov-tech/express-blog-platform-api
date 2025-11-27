import type { LikeStatus } from '../../domain/types/like.types.js';

export interface LikesAggregation {
  [key: string]: { likesCount: number; dislikesCount: number };
}
export interface UserStatusAggregation {
  [key: string]: LikeStatus;
}
