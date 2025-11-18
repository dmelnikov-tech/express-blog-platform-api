import { randomUUID } from 'crypto';
import type { Blog, BlogResponseDto, CreateBlogDto, UpdateBlogDto } from '../types/domain/blog.types.js';
import type { BlogDocument } from '../types/infrastructure/blog.document.types.js';
import type { PaginationSortParams, PaginatedSortedResponse } from '../types/domain/pagination.types.js';
import { blogsRepository } from '../repositories/blogs.repository.js';

export const blogsService = {
  async getBlogs(params: PaginationSortParams): Promise<PaginatedSortedResponse<BlogResponseDto>> {
    const { items, totalCount } = await blogsRepository.find(params);
    const blogs = this._mapBlogsToResponseDto(items);

    const pagesCount = Math.ceil(totalCount / params.pageSize);

    return {
      pagesCount,
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
      items: blogs,
    };
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
