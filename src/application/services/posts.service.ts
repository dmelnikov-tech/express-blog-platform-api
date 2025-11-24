import { randomUUID } from 'crypto';
import type { PostResponseDto, CreatePostDto, UpdatePostDto } from '../dto/post.dto.js';
import type { PaginationSortParams, PaginatedSortedResponse } from '../../domain/types/pagination.types.js';
import type { Post } from '../../domain/entities/post.entity.js';
import type { PostDocument } from '../../infrastructure/types/post.document.types.js';
import { postsRepository } from '../../infrastructure/database/repositories/posts.repository.js';
import { blogsService } from './blogs.service.js';
import { ERROR_MESSAGES } from '../../shared/constants/error-messages.js';
import { createPaginatedResponse } from '../../shared/utils/pagination.utils.js';

export const postsService = {
  async getPosts(params: PaginationSortParams): Promise<PaginatedSortedResponse<PostResponseDto>> {
    const { items, totalCount }: { items: PostDocument[]; totalCount: number } = await postsRepository.find(params);
    const posts: PostResponseDto[] = this._mapPostsToResponseDto(items);
    return createPaginatedResponse<PostResponseDto>(posts, totalCount, params);
  },

  async getPostsByBlogId(
    blogId: string,
    params: PaginationSortParams
  ): Promise<PaginatedSortedResponse<PostResponseDto>> {
    const { items, totalCount }: { items: PostDocument[]; totalCount: number } = await postsRepository.findByBlogId(blogId, params);
    const posts: PostResponseDto[] = this._mapPostsToResponseDto(items);
    return createPaginatedResponse<PostResponseDto>(posts, totalCount, params);
  },

  async getPostById(id: string): Promise<PostResponseDto | null> {
    const post: PostDocument | null = await postsRepository.findById(id);
    return post ? this._mapPostToResponseDto(post) : null;
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

  _mapPostToResponseDto(post: PostDocument): PostResponseDto {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
    };
  },
  _mapPostsToResponseDto(posts: PostDocument[]): PostResponseDto[] {
    return posts.map(post => this._mapPostToResponseDto(post));
  },
};
