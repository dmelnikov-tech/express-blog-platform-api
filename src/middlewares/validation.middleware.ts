import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { HTTP_STATUSES } from '../constants/http-statuses.js';

// error handler
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUSES.BAD_REQUEST).send({
      errorsMessages: errors.array().map(error => {
        const fieldError = error as { path?: string; param?: string }; //  в express-validator v7 имя поля с ошибкой может быть в path или param в зависимости от типа ошибки.
        return {
          message: error.msg,
          field: fieldError.path || fieldError.param || '',
        };
      }),
    });
  }
  next();
};

// validation rules
export const blogValidationMiddleware = [
  body('name')
    .isString()
    .withMessage('name must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('name should not be empty')
    .bail()
    .isLength({ max: 15 })
    .withMessage('name should not be longer than 15 characters'),
  body('description')
    .isString()
    .withMessage('description must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('description should not be empty')
    .bail()
    .isLength({ max: 500 })
    .withMessage('description should not be longer than 500 characters'),
  body('websiteUrl')
    .isString()
    .withMessage('websiteUrl must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('websiteUrl should not be empty')
    .bail()
    .isLength({ max: 100 })
    .withMessage('websiteUrl should not be longer than 100 characters')
    .bail()
    .isURL()
    .withMessage('websiteUrl must be a valid URL'),
  handleValidationErrors,
];

export const postValidationMiddleware = [
  body('title')
    .isString()
    .withMessage('title must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('title should not be empty')
    .bail()
    .isLength({ max: 30 })
    .withMessage('title should not be longer than 30 characters'),
  body('shortDescription')
    .isString()
    .withMessage('shortDescription must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('shortDescription should not be empty')
    .bail()
    .isLength({ max: 100 })
    .withMessage('shortDescription should not be longer than 100 characters'),
  body('content')
    .isString()
    .withMessage('content must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('content should not be empty')
    .bail()
    .isLength({ max: 1000 })
    .withMessage('content should not be longer than 1000 characters'),
  body('blogId')
    .isString()
    .withMessage('blogId must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('blogId should not be empty')
    .bail()
    .isUUID()
    .withMessage('blogId must be a valid UUID'),
  handleValidationErrors,
];

export const createPostForBlogValidationMiddleware = [
  body('title')
    .isString()
    .withMessage('title must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('title should not be empty')
    .bail()
    .isLength({ max: 30 })
    .withMessage('title should not be longer than 30 characters'),
  body('shortDescription')
    .isString()
    .withMessage('shortDescription must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('shortDescription should not be empty')
    .bail()
    .isLength({ max: 100 })
    .withMessage('shortDescription should not be longer than 100 characters'),
  body('content')
    .isString()
    .withMessage('content must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('content should not be empty')
    .bail()
    .isLength({ max: 1000 })
    .withMessage('content should not be longer than 1000 characters'),
  handleValidationErrors,
];

export const createUserValidationMiddleware = [
  body('login')
    .isString()
    .withMessage('login must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('login should not be empty')
    .bail()
    .isLength({ min: 3, max: 10 })
    .withMessage('login should be between 3 and 10 characters')
    .bail()
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage('login must match pattern ^[a-zA-Z0-9_-]*$'),
  body('password')
    .isString()
    .withMessage('password must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('password should not be empty')
    .bail()
    .isLength({ min: 6, max: 20 })
    .withMessage('password should be between 6 and 20 characters'),
  body('email')
    .isString()
    .withMessage('email must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('email should not be empty')
    .bail()
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage('email must match pattern ^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'),
  handleValidationErrors,
];

export const loginValidationMiddleware = [
  body('loginOrEmail')
    .isString()
    .withMessage('loginOrEmail must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('loginOrEmail should not be empty'),
  body('password')
    .isString()
    .withMessage('password must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('password should not be empty')
    .bail()
    .isLength({ min: 6, max: 20 })
    .withMessage('password should be between 6 and 20 characters'),
  handleValidationErrors,
];
