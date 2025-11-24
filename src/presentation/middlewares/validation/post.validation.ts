import { body } from 'express-validator';
import { handleValidationErrors } from './validation-handler.js';

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

