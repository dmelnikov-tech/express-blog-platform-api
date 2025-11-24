import { body } from 'express-validator';
import { handleValidationErrors } from './validation-handler.js';

export const createCommentValidationMiddleware = [
  body('content')
    .isString()
    .withMessage('content must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('content should not be empty')
    .bail()
    .isLength({ min: 20, max: 300 })
    .withMessage('content should be between 20 and 300 characters'),
  handleValidationErrors,
];

