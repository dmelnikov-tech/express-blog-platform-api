import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { HTTP_STATUSES } from '../../../shared/constants/http-statuses.js';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUSES.BAD_REQUEST).send({
      errorsMessages: errors.array().map(error => {
        const fieldError = error as { path?: string; param?: string };
        return {
          message: error.msg,
          field: fieldError.path || fieldError.param || '',
        };
      }),
    });
  }
  next();
};
