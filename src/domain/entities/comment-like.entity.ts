import type { CommentLikeStatus } from '../types/comment.types.js';

export interface CommentLike {
  id: string;
  commentId: string;
  userId: string;
  likeStatus: CommentLikeStatus;
  createdAt: string;
  updatedAt: string;
}
