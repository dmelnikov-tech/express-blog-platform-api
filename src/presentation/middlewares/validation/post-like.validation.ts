import { body } from 'express-validator';
import { handleValidationErrors } from './validation-handler.js';

export const updatePostLikeStatusValidationMiddleware = [
  body('likeStatus')
    .isString()
    .withMessage('content must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('content should not be empty')
    .bail()
    .isIn(['Like', 'Dislike', 'None'])
    .withMessage('likeStatus must be one of the following values: Like, Dislike, None'),
  handleValidationErrors,
];

