import { randomUUID } from 'crypto';
import type { CommentResponseDto, CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto.js';
import type { PaginationSortParams, PaginatedSortedResponse } from '../../domain/types/pagination.types.js';
import type { Comment } from '../../domain/entities/comment.entity.js';
import type { CommentDocument } from '../../infrastructure/types/comment.document.types.js';
import { commentsRepository } from '../../infrastructure/database/repositories/comments.repository.js';
import { usersRepository } from '../../infrastructure/database/repositories/users.repository.js';
import { postsRepository } from '../../infrastructure/database/repositories/posts.repository.js';
import { ERROR_MESSAGES } from '../../shared/constants/error-messages.js';
import { createPaginatedResponse } from '../../shared/utils/pagination.utils.js';

export const commentsService = {
  async getCommentsByPostId(
    postId: string,
    params: PaginationSortParams
  ): Promise<PaginatedSortedResponse<CommentResponseDto>> {
    const post = await postsRepository.findById(postId);
    if (!post) {
      throw new Error(ERROR_MESSAGES.POST_NOT_FOUND);
    }

    const { items, totalCount }: { items: CommentDocument[]; totalCount: number } = await commentsRepository.findByPostId(postId, params);
    const comments: CommentResponseDto[] = this._mapCommentsToResponseDto(items);
    return createPaginatedResponse<CommentResponseDto>(comments, totalCount, params);
  },

  async getCommentById(id: string): Promise<CommentResponseDto | null> {
    const comment: CommentDocument | null = await commentsRepository.findById(id);
    return comment ? this._mapCommentToResponseDto(comment) : null;
  },

  async createComment(postId: string, userId: string, data: CreateCommentDto): Promise<CommentResponseDto> {
    const post = await postsRepository.findById(postId);
    if (!post) {
      throw new Error(ERROR_MESSAGES.POST_NOT_FOUND);
    }

    const user = await usersRepository.findById(userId);
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

  async updateComment(commentId: string, userId: string, data: UpdateCommentDto): Promise<boolean> {
    const comment = await commentsRepository.findById(commentId);
    if (!comment) {
      throw new Error(ERROR_MESSAGES.COMMENT_NOT_FOUND);
    }

    if (comment.commentatorInfo.userId !== userId) {
      throw new Error(ERROR_MESSAGES.COMMENT_FORBIDDEN);
    }

    const updatedComment: CommentDocument | null = await commentsRepository.update(commentId, {
      content: data.content,
    });
    return updatedComment ? true : false;
  },

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const comment = await commentsRepository.findById(commentId);
    if (!comment) {
      throw new Error(ERROR_MESSAGES.COMMENT_NOT_FOUND);
    }

    if (comment.commentatorInfo.userId !== userId) {
      throw new Error(ERROR_MESSAGES.COMMENT_FORBIDDEN);
    }

    return await commentsRepository.delete(commentId);
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
