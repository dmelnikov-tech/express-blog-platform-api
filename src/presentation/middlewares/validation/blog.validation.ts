import { body } from 'express-validator';
import { handleValidationErrors } from './validation-handler.js';

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

