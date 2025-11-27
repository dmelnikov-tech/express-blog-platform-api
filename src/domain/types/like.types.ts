export type LikeStatus = 'None' | 'Like' | 'Dislike';

export interface NewestLike {
  userId: string;
  addedAt: string;
}

export interface NewestLikeWithUser {
  userId: string;
  addedAt: string;
  login: string;
}