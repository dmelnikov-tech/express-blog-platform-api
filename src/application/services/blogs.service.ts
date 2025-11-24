import { randomUUID } from 'crypto';
import type { BlogResponseDto, CreateBlogDto, UpdateBlogDto } from '../dto/blog.dto.js';
import type {
  PaginationSortParams,
  PaginatedSortedResponse,
  BlogPaginationSortParams,
} from '../../domain/types/pagination.types.js';
import type { Blog } from '../../domain/entities/blog.entity.js';
import type { BlogDocument } from '../../infrastructure/types/blog.document.types.js';
import { blogsRepository } from '../../infrastructure/database/repositories/blogs.repository.js';
import { createPaginatedResponse } from '../../shared/utils/pagination.utils.js';

export const blogsService = {
  async getBlogs(params: BlogPaginationSortParams): Promise<PaginatedSortedResponse<BlogResponseDto>> {
    const { items, totalCount } = await blogsRepository.find(params);
    const blogs = this._mapBlogsToResponseDto(items);
    return createPaginatedResponse<BlogResponseDto>(blogs, totalCount, params);
  },

  async getBlogById(id: string): Promise<BlogResponseDto | null> {
    const blog: BlogDocument | null = await blogsRepository.findById(id);
    return blog ? this._mapBlogToResponseDto(blog) : null;
  },

  async createBlog(data: CreateBlogDto): Promise<BlogResponseDto> {
    const newBlog: Blog = {
      id: randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    const createdBlog = await blogsRepository.create(newBlog);
    return this._mapBlogToResponseDto(createdBlog);
  },

  async updateBlog(id: string, data: UpdateBlogDto): Promise<boolean> {
    const blog: BlogDocument | null = await blogsRepository.update(id, data);
    return blog ? true : false;
  },

  async deleteBlog(id: string): Promise<boolean> {
    return await blogsRepository.delete(id);
  },

  _mapBlogToResponseDto(blog: BlogDocument): BlogResponseDto {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  },
  _mapBlogsToResponseDto(blogs: BlogDocument[]): BlogResponseDto[] {
    return blogs.map(blog => this._mapBlogToResponseDto(blog));
  },
};
