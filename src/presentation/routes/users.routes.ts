import { Router, Response } from 'express';
import { usersService } from '../../application/services/users.service.js';
import { HTTP_STATUSES } from '../../shared/constants/http-statuses.js';
import type { UserResponseDto, CreateUserDto, CreateUserResult } from '../../application/dto/user.dto.js';
import type {
  PaginatedSortedResponse,
  UserPaginationSortParams,
  UserPaginationSortQuery,
} from '../../domain/types/pagination.types.js';
import {
  RequestWithQuery,
  RequestWithParams,
  RequestWithBody,
  ParamsId,
} from '../../shared/types/express-request.types.js';
import { basicAuthMiddleware } from '../middlewares/basic-auth.middleware.js';
import { createUserValidationMiddleware } from '../middlewares/validation/user.validation.js';
import { getPaginationSortParams } from '../../shared/utils/pagination-sort.utils.js';

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
      const { login, password, email }: CreateUserDto = req.body;
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
    const { id }: ParamsId = req.params;
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
