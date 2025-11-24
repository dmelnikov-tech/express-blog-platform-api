import { Router, Response } from 'express';
import { postsService } from '../../application/services/posts.service.js';
import { commentsService } from '../../application/services/comments.service.js';
import { HTTP_STATUSES } from '../../shared/constants/http-statuses.js';
import { ERROR_MESSAGES } from '../../shared/constants/error-messages.js';
import type { PostResponseDto, CreatePostDto, UpdatePostDto } from '../../application/dto/post.dto.js';
import type { CommentResponseDto, CreateCommentDto } from '../../application/dto/comment.dto.js';
import type { PaginatedSortedResponse, PaginationSortQuery } from '../../domain/types/pagination.types.js';
import {
  RequestWithQuery,
  RequestWithParams,
  RequestWithBody,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  ParamsId,
  ParamsPostId,
} from '../../shared/types/express-request.types.js';
import { basicAuthMiddleware } from '../middlewares/basic-auth.middleware.js';
import { bearerAuthMiddleware } from '../middlewares/bearer-auth.middleware.js';
import { postValidationMiddleware } from '../middlewares/validation/post.validation.js';
import { createCommentValidationMiddleware } from '../middlewares/validation/comment.validation.js';
import { getPaginationSortParams } from '../../shared/utils/pagination-sort.utils.js';

const router = Router();

router.get('/', async (req: RequestWithQuery<PaginationSortQuery>, res: Response) => {
  try {
    const paginationParams = getPaginationSortParams(req.query, 'posts');
    const posts: PaginatedSortedResponse<PostResponseDto> = await postsService.getPosts(paginationParams);
    res.status(HTTP_STATUSES.OK).send(posts);
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

router.get('/:id', async (req: RequestWithParams<ParamsId>, res: Response) => {
  try {
    const { id } = req.params;
    const post: PostResponseDto | null = await postsService.getPostById(id);

    if (!post) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
    }

    res.status(HTTP_STATUSES.OK).send(post);
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

router.post(
  '/',
  basicAuthMiddleware,
  postValidationMiddleware,
  async (req: RequestWithBody<CreatePostDto>, res: Response) => {
    try {
      const { title, shortDescription, content, blogId } = req.body;
      const post: PostResponseDto = await postsService.createPost({
        title,
        shortDescription,
        content,
        blogId,
      });
      res.status(HTTP_STATUSES.CREATED).send(post);
    } catch (error) {
      if (error instanceof Error && error.message === ERROR_MESSAGES.BLOG_NOT_FOUND) {
        return res.status(HTTP_STATUSES.NOT_FOUND).send({ message: ERROR_MESSAGES.BLOG_NOT_FOUND });
      }
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

router.put(
  '/:id',
  basicAuthMiddleware,
  postValidationMiddleware,
  async (req: RequestWithParamsAndBody<ParamsId, UpdatePostDto>, res: Response) => {
    try {
      const { id } = req.params;
      const { title, shortDescription, content, blogId } = req.body;
      const updateResult: boolean = await postsService.updatePost(id, {
        title,
        shortDescription,
        content,
        blogId,
      });

      if (!updateResult) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT);
    } catch (error) {
      if (error instanceof Error && error.message === ERROR_MESSAGES.BLOG_NOT_FOUND) {
        return res.status(HTTP_STATUSES.NOT_FOUND).send({ message: ERROR_MESSAGES.BLOG_NOT_FOUND });
      }
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

router.delete('/:id', basicAuthMiddleware, async (req: RequestWithParams<ParamsId>, res: Response) => {
  try {
    const { id } = req.params;
    const deleteResult: boolean = await postsService.deletePost(id);

    if (!deleteResult) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTENT);
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

router.get(
  '/:postId/comments',
  async (req: RequestWithParamsAndQuery<ParamsPostId, PaginationSortQuery>, res: Response) => {
    try {
      const { postId } = req.params;
      const paginationParams = getPaginationSortParams(req.query, 'comments');
      const comments: PaginatedSortedResponse<CommentResponseDto> = await commentsService.getCommentsByPostId(
        postId,
        paginationParams
      );
      res.status(HTTP_STATUSES.OK).send(comments);
    } catch (error) {
      if (error instanceof Error && error.message === ERROR_MESSAGES.POST_NOT_FOUND) {
        return res.status(HTTP_STATUSES.NOT_FOUND).send({ message: error.message });
      }
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

router.post(
  '/:postId/comments',
  bearerAuthMiddleware,
  createCommentValidationMiddleware,
  async (req: RequestWithParamsAndBody<ParamsPostId, CreateCommentDto>, res: Response) => {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const comment: CommentResponseDto = await commentsService.createComment(postId, req.userId, {
        content,
      });
      res.status(HTTP_STATUSES.CREATED).send(comment);
    } catch (error) {
      if (error instanceof Error && error.message === ERROR_MESSAGES.POST_NOT_FOUND) {
        return res.status(HTTP_STATUSES.NOT_FOUND).send({ message: error.message });
      }
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

export default router;

