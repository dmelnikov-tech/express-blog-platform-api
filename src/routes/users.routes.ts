import { Router, Response } from 'express';
import { usersService } from '../services/users.service.js';
import { HTTP_STATUSES } from '../constants/http-statuses.js';
import type { UserResponseDto, CreateUserDto } from '../types/domain/user.types.js';
import type {
  PaginatedSortedResponse,
  UserPaginationSortParams,
  UserPaginationSortQuery,
} from '../types/domain/pagination.types.js';
import { RequestWithQuery, RequestWithParams, RequestWithBody, ParamsId } from '../types/express-request.types.js';
import { basicAuthMiddleware } from '../middlewares/basic-auth.middleware.js';
import { createUserValidationMiddleware } from '../middlewares/validation.middleware.js';
import { getPaginationSortParams } from '../utils/pagination-sort.utils.js';
import type { CreateUserResult } from '../types/domain/user.types.js';

const router = Router();

router.get('/', basicAuthMiddleware, async (req: RequestWithQuery<UserPaginationSortQuery>, res: Response) => {
  try {
    const paginationSortParams: UserPaginationSortParams = getPaginationSortParams(req.query, 'users');
    const users: PaginatedSortedResponse<UserResponseDto> = await usersService.getUsers(paginationSortParams);
    res.status(HTTP_STATUSES.OK).send(users);
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

router.post(
  '/',
  basicAuthMiddleware,
  createUserValidationMiddleware,
  async (req: RequestWithBody<CreateUserDto>, res: Response) => {
    try {
      const { login, password, email } = req.body;
      const createResult: CreateUserResult = await usersService.createUser({
        login,
        password,
        email,
      });

      if (!createResult.success) {
        return res.status(HTTP_STATUSES.BAD_REQUEST).send({
          errorsMessages: [
            {
              message: createResult.error.message,
              field: createResult.error.field,
            },
          ],
        });
      }

      res.status(HTTP_STATUSES.CREATED).send(createResult.data);
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

router.delete('/:id', basicAuthMiddleware, async (req: RequestWithParams<ParamsId>, res: Response) => {
  try {
    const { id } = req.params;
    const deleteResult: boolean = await usersService.deleteUser(id);

    if (!deleteResult) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTENT);
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

export default router;
