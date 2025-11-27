import { randomUUID } from 'crypto';
import type { PostResponseDto, CreatePostDto, UpdatePostDto } from '../dto/post.dto.js';
import type { PaginationSortParams, PaginatedSortedResponse } from '../../domain/types/pagination.types.js';
import type { Post } from '../../domain/entities/post.entity.js';
import type { PostDocument } from '../../infrastructure/types/post.document.types.js';
import type { LikeStatus } from '../../domain/types/like.types.js';
import { postsRepository } from '../../infrastructure/database/repositories/posts.repository.js';
import { postLikesRepository } from '../../infrastructure/database/repositories/post-likes.repository.js';
import { blogsService } from './blogs.service.js';
import { ERROR_MESSAGES } from '../../shared/constants/error-messages.js';
import { createPaginatedResponse } from '../../shared/utils/pagination.utils.js';
import type { LikesAggregation, UserStatusAggregation } from '../../infrastructure/types/likes-aggregation.types.js';

export const postsService = {
  async getPosts(params: PaginationSortParams, currentUserId?: string): Promise<PaginatedSortedResponse<PostResponseDto>> {
    const { items, totalCount }: { items: PostDocument[]; totalCount: number } = await postsRepository.find(params);
    
    const postsIds: string[] = items.map(post => post.id);
    
    const [likesAggregation, userStatuses] = await Promise.all([
      postLikesRepository.getLikesAggregation(postsIds),
      currentUserId
        ? postLikesRepository.getUserStatuses(postsIds, currentUserId)
        : Promise.resolve<UserStatusAggregation>({}),
    ]);
    
    const posts: PostResponseDto[] = this._mapPostsToResponseDto(items, likesAggregation, userStatuses);
    return createPaginatedResponse<PostResponseDto>(posts, totalCount, params);
  },

  async getPostsByBlogId(
    blogId: string,
    params: PaginationSortParams,
    currentUserId?: string
  ): Promise<PaginatedSortedResponse<PostResponseDto>> {
    const { items, totalCount }: { items: PostDocument[]; totalCount: number } = await postsRepository.findByBlogId(blogId, params);
    
    const postsIds: string[] = items.map(post => post.id);
    
    const [likesAggregation, userStatuses] = await Promise.all([
      postLikesRepository.getLikesAggregation(postsIds),
      currentUserId
        ? postLikesRepository.getUserStatuses(postsIds, currentUserId)
        : Promise.resolve<UserStatusAggregation>({}),
    ]);
    
    const posts: PostResponseDto[] = this._mapPostsToResponseDto(items, likesAggregation, userStatuses);
    return createPaginatedResponse<PostResponseDto>(posts, totalCount, params);
  },

  async getPostById(id: string, currentUserId?: string): Promise<PostResponseDto | null> {
    const post: PostDocument | null = await postsRepository.findById(id);
    if (!post) {
      return null;
    }

    const postsIds: string[] = [post.id]; // умышленно создаем массив из одного элемента, чтобы использовать в агрегации
    const likesAggregationPromise = postLikesRepository.getLikesAggregation(postsIds);
    const userStatusesPromise = currentUserId
      ? postLikesRepository.getUserStatuses(postsIds, currentUserId)
      : Promise.resolve<UserStatusAggregation>({});
    const [likesAggregation, userStatuses]: [LikesAggregation, UserStatusAggregation] = await Promise.all([
      likesAggregationPromise,
      userStatusesPromise,
    ]);

    return this._mapPostToResponseDto(post, likesAggregation, userStatuses);
  },

  async createPost(data: CreatePostDto): Promise<PostResponseDto> {
    const blog = await blogsService.getBlogById(data.blogId);
    if (!blog) {
      throw new Error(ERROR_MESSAGES.BLOG_NOT_FOUND);
    }

    const newPost: Post = {
      id: randomUUID(),
      ...data,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
    };
    const createdPost = await postsRepository.create(newPost);
    return this._mapPostToResponseDto(createdPost);
  },

  async updatePost(id: string, data: UpdatePostDto): Promise<boolean> {
    const blog = await blogsService.getBlogById(data.blogId);
    if (!blog) {
      throw new Error(ERROR_MESSAGES.BLOG_NOT_FOUND);
    }

    const updateData = {
      ...data,
      blogName: blog.name,
    };
    const post: PostDocument | null = await postsRepository.update(id, updateData);
    return post ? true : false;
  },

  async deletePost(id: string): Promise<boolean> {
    return await postsRepository.delete(id);
  },

  async updatePostLikeStatus(postId: string, userId: string, likeStatus: LikeStatus): Promise<boolean> {
    const post = await postsRepository.findById(postId);
    if (!post) {
      return false;
    }

    const currentStatus: LikeStatus = await postLikesRepository.getUserStatus(postId, userId);

    if (currentStatus === likeStatus) {
      return true;
    }

    await postLikesRepository.updateLikeStatus(postId, userId, likeStatus);
    return true;
  },

  _mapPostToResponseDto(
    post: PostDocument,
    likesAggregation: LikesAggregation = {},
    userStatuses: UserStatusAggregation = {}
  ): PostResponseDto {
    const statuses = likesAggregation[post.id] ?? { likesCount: 0, dislikesCount: 0 };
    const myStatus: LikeStatus = userStatuses[post.id] ?? 'None';

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      likesInfo: {
        likesCount: statuses.likesCount,
        dislikesCount: statuses.dislikesCount,
        myStatus,
      },
    };
  },
  _mapPostsToResponseDto(
    posts: PostDocument[],
    likesAggregation: LikesAggregation = {},
    userStatuses: UserStatusAggregation = {}
  ): PostResponseDto[] {
    return posts.map(post => this._mapPostToResponseDto(post, likesAggregation, userStatuses));
  },
};
