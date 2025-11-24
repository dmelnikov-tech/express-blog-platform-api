import { Router, Request, Response } from 'express';
import { HTTP_STATUSES } from '../constants/http-statuses.js';
import { blogsRepository } from '../repositories/blogs.repository.js';
import { postsRepository } from '../repositories/posts.repository.js';
import { usersRepository } from '../repositories/users.repository.js';
import { commentsRepository } from '../repositories/comments.repository.js';
import { refreshTokensRepository } from '../repositories/refresh-tokens.repository.js';

const router = Router();

router.delete('/all-data', async (req: Request, res: Response) => {
  try {
    await blogsRepository.deleteAll();
    await postsRepository.deleteAll();
    await usersRepository.deleteAll();
    await commentsRepository.deleteAll();
    await refreshTokensRepository.deleteAll();
    res.sendStatus(HTTP_STATUSES.NO_CONTENT);
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

export default router;
