import { body } from 'express-validator';
import { handleValidationErrors } from './validation-handler.js';

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

