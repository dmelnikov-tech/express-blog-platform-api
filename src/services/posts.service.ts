import { randomUUID } from "crypto";
import type {
  Post,
  PostResponseDto,
  CreatePostDto,
  UpdatePostDto,
} from "../types/domain/post.types.js";
import type { PostDocument } from "../types/infrastructure/post.document.types.js";
import type {
  PaginationSortParams,
  PaginatedSortedResponse,
} from "../types/domain/pagination.types.js";
import { postsRepository } from "../repositories/posts.repository.js";
import { blogsService } from "./blogs.service.js";
import { ERROR_MESSAGES } from "../constants/error-messages.js";

export const postsService = {
  async getPosts(
    params: PaginationSortParams
  ): Promise<PaginatedSortedResponse<PostResponseDto>> {
    const { items, totalCount } = await postsRepository.find(params);
    const posts = this._mapPostsToResponseDto(items);

    const pagesCount = Math.ceil(totalCount / params.pageSize);

    return {
      pagesCount,
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
      items: posts,
    };
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
    const post: PostDocument | null = await postsRepository.update(
      id,
      updateData
    );
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
    return posts.map((post) => this._mapPostToResponseDto(post));
  },
};
