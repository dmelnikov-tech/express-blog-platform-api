import { randomUUID } from 'crypto';
import type { Comment, CommentResponseDto, CreateCommentDto } from '../types/domain/comment.types.js';
import type { CommentDocument } from '../types/infrastructure/comment.document.types.js';
import type { PaginationSortParams, PaginatedSortedResponse } from '../types/domain/pagination.types.js';
import { commentsRepository } from '../repositories/comments.repository.js';
import { usersRepository } from '../repositories/users.repository.js';
import { postsRepository } from '../repositories/posts.repository.js';
import { ERROR_MESSAGES } from '../constants/error-messages.js';

export const commentsService = {
  async getCommentsByPostId(
    postId: string,
    params: PaginationSortParams
  ): Promise<PaginatedSortedResponse<CommentResponseDto>> {
    const post = await postsRepository.findById(postId);
    if (!post) {
      throw new Error(ERROR_MESSAGES.POST_NOT_FOUND);
    }

    const { items, totalCount } = await commentsRepository.findByPostId(postId, params);
    const comments = this._mapCommentsToResponseDto(items);

    const pagesCount = Math.ceil(totalCount / params.pageSize);

    return {
      pagesCount,
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
      items: comments,
    };
  },
  
  async createComment(postId: string, userId: string, data: CreateCommentDto): Promise<CommentResponseDto> {
    const post = await postsRepository.findById(postId);
    if (!post) {
      throw new Error(ERROR_MESSAGES.POST_NOT_FOUND);
    }

    const user = await usersRepository.findById(userId);
    // user должен существовать, так как токен валидный (проверен в bearerAuthMiddleware)
    if (!user) {
      throw new Error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }

    const newComment: Comment = {
      id: randomUUID(),
      content: data.content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
      },
      createdAt: new Date().toISOString(),
      postId,
    };

    const createdComment = await commentsRepository.create(newComment);
    return this._mapCommentToResponseDto(createdComment);
  },

  _mapCommentToResponseDto(comment: CommentDocument): CommentResponseDto {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
    };
  },

  _mapCommentsToResponseDto(comments: CommentDocument[]): CommentResponseDto[] {
    return comments.map(comment => this._mapCommentToResponseDto(comment));
  },
};
