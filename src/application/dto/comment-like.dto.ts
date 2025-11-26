import { CommentLikeStatus } from '../../domain/types/comment.types.js';

export interface UpdateCommentLikeStatusDto {
  likeStatus: CommentLikeStatus;
}
