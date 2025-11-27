export type LikeStatus = 'None' | 'Like' | 'Dislike';

export interface EntityLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
}
