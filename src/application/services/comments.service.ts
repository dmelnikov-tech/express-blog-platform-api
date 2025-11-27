import { randomUUID } from 'crypto';
import type { CommentResponseDto, CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto.js';
import type { PaginationSortParams, PaginatedSortedResponse } from '../../domain/types/pagination.types.js';
import type { Comment } from '../../domain/entities/comment.entity.js';
import type { CommentDocument } from '../../infrastructure/types/comment.document.types.js';
import type { LikeStatus } from '../../domain/types/like.types.js';
import { commentsRepository } from '../../infrastructure/database/repositories/comments.repository.js';
import { commentLikesRepository } from '../../infrastructure/database/repositories/comment-likes.repository.js';
import { usersService } from './users.service.js';
import { postsService } from './posts.service.js';
import { ERROR_MESSAGES } from '../../shared/constants/error-messages.js';
import { createPaginatedResponse } from '../../shared/utils/pagination.utils.js';
import type { LikesAggregation, UserStatusAggregation } from '../../infrastructure/types/likes-aggregation.types.js';

export const commentsService = {
  async getCommentsByPostId(
    postId: string,
    params: PaginationSortParams,
    currentUserId: string | undefined
  ): Promise<PaginatedSortedResponse<CommentResponseDto>> {
    const post = await postsService.getPostById(postId);
    if (!post) {
      throw new Error(ERROR_MESSAGES.POST_NOT_FOUND);
    }

    const { items, totalCount } = await commentsRepository.findByPostId(postId, params);

    const commentIds: string[] = items.map(comment => comment.id);

    const [likesAggregation, userStatuses] = await Promise.all([
      commentLikesRepository.getLikesAggregation(commentIds),
      currentUserId
        ? commentLikesRepository.getUserStatuses(commentIds, currentUserId)
        : Promise.resolve<UserStatusAggregation>({}),
    ]);

    const comments: CommentResponseDto[] = this._mapCommentsToResponseDto(items, likesAggregation, userStatuses);

    return createPaginatedResponse(comments, totalCount, params);
  },

  async getCommentById(id: string, currentUserId: string | undefined): Promise<CommentResponseDto | null> {
    const comment: CommentDocument | null = await commentsRepository.findById(id);
    if (!comment) {
      return null;
    }

    const commentIds: string[] = [comment.id]; // умышленно создаем массив из одного элемента, чтобы использовать в агрегации
    const likesAggregationPromise = commentLikesRepository.getLikesAggregation(commentIds);
    const userStatusesPromise = currentUserId
      ? commentLikesRepository.getUserStatuses(commentIds, currentUserId)
      : Promise.resolve<UserStatusAggregation>({});
    const [likesAggregation, userStatuses]: [LikesAggregation, UserStatusAggregation] = await Promise.all([
      likesAggregationPromise,
      userStatusesPromise,
    ]);

    return this._mapCommentToResponseDto(comment, likesAggregation, userStatuses);
  },

  async createComment(postId: string, userId: string, data: CreateCommentDto): Promise<CommentResponseDto> {
    const post = await postsService.getPostById(postId);
    if (!post) {
      throw new Error(ERROR_MESSAGES.POST_NOT_FOUND);
    }

    const user = await usersService.getUserById(userId);
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

  async updateCommentLikeStatus(commentId: string, userId: string, likeStatus: LikeStatus): Promise<boolean> {
    const comment = await commentsRepository.findById(commentId);
    if (!comment) {
      return false;
    }

    const currentStatus: LikeStatus = await commentLikesRepository.getUserStatus(commentId, userId);

    if (currentStatus === likeStatus) {
      return true;
    }

    await commentLikesRepository.updateLikeStatus(commentId, userId, likeStatus);
    return true;
  },

  _mapCommentToResponseDto(
    comment: CommentDocument,
    likesAggregation: LikesAggregation = {},
    userStatuses: UserStatusAggregation = {}
  ): CommentResponseDto {
    const statuses = likesAggregation[comment.id] ?? { likesCount: 0, dislikesCount: 0 };
    const myStatus: LikeStatus = userStatuses[comment.id] ?? 'None';

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: statuses.likesCount,
        dislikesCount: statuses.dislikesCount,
        myStatus,
      },
    };
  },

  _mapCommentsToResponseDto(
    comments: CommentDocument[],
    likesAggregation: LikesAggregation = {},
    userStatuses: UserStatusAggregation = {}
  ): CommentResponseDto[] {
    return comments.map(comment => this._mapCommentToResponseDto(comment, likesAggregation, userStatuses));
  },
};
