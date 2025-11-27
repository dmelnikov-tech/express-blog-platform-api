import type { LikeStatus } from '../types/like.types.js';

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  likeStatus: LikeStatus;
  createdAt: string;
  updatedAt: string;
}
