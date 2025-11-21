import { Router, Response } from 'express';
import { commentsService } from '../services/comments.service.js';
import { HTTP_STATUSES } from '../constants/http-statuses.js';
import { ERROR_MESSAGES } from '../constants/error-messages.js';
import type { CommentResponseDto, UpdateCommentDto } from '../types/domain/comment.types.js';
import { RequestWithParams, RequestWithParamsAndBody, ParamsId } from '../types/express-request.types.js';
import { bearerAuthMiddleware } from '../middlewares/bearer-auth.middleware.js';
import { createCommentValidationMiddleware } from '../middlewares/validation.middleware.js';

const router = Router();

router.get('/:id', async (req: RequestWithParams<ParamsId>, res: Response) => {
  try {
    const { id } = req.params;
    const comment: CommentResponseDto | null = await commentsService.getCommentById(id);

    if (!comment) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
    }

    res.status(HTTP_STATUSES.OK).send(comment);
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

router.put(
  '/:id',
  bearerAuthMiddleware,
  createCommentValidationMiddleware,
  async (req: RequestWithParamsAndBody<ParamsId, UpdateCommentDto>, res: Response) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const updateResult: boolean = await commentsService.updateComment(id, req.userId, { content });

      if (!updateResult) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === ERROR_MESSAGES.COMMENT_NOT_FOUND) {
          return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
        }
        if (error.message === ERROR_MESSAGES.COMMENT_FORBIDDEN) {
          return res.sendStatus(HTTP_STATUSES.FORBIDDEN);
        }
      }
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

router.delete('/:id', bearerAuthMiddleware, async (req: RequestWithParams<ParamsId>, res: Response) => {
  try {
    const { id } = req.params;
    const deleteResult: boolean = await commentsService.deleteComment(id, req.userId);

    if (!deleteResult) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTENT);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === ERROR_MESSAGES.COMMENT_NOT_FOUND) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
      }
      if (error.message === ERROR_MESSAGES.COMMENT_FORBIDDEN) {
        return res.sendStatus(HTTP_STATUSES.FORBIDDEN);
      }
    }
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

export default router;
