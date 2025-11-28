import { body } from 'express-validator';
import { handleValidationErrors } from './validation-handler.js';

export const updateLikeStatusValidationMiddleware = [
  body('likeStatus')
    .isString()
    .withMessage('likeStatus must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('likeStatus should not be empty')
    .bail()
    .isIn(['Like', 'Dislike', 'None'])
    .withMessage('likeStatus must be one of the following values: Like, Dislike, None'),
  handleValidationErrors,
];

