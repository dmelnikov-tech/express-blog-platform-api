import type { LikeStatus } from '../types/like.types.js';

export interface CommentLike {
  id: string;
  commentId: string;
  userId: string;
  likeStatus: LikeStatus;
  createdAt: string;
  updatedAt: string;
}
