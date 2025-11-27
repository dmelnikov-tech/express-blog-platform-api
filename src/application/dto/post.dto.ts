import type { LikeStatus } from '../../domain/types/like.types.js';

export interface PostResponseDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: Array<{
      addedAt: string;
      userId: string;
      login: string;
    }>;
  };
}

export interface CreatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export interface UpdatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export interface CreatePostByBlogIdDto {
  title: string;
  shortDescription: string;
  content: string;
}

