export type CommentLikeStatus = 'None' | 'Like' | 'Dislike';

export interface CommentLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: CommentLikeStatus;
}
