import { body } from 'express-validator';
import { handleValidationErrors } from './validation-handler.js';

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

export const emailValidationMiddleware = [
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

export const confirmationCodeValidationMiddleware = [
  body('code')
    .isString()
    .withMessage('code must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('code should not be empty')
    .bail()
    .isUUID()
    .withMessage('code must be a valid UUID'),
  handleValidationErrors,
];

export const newPasswordValidationMiddleware = [
  body('newPassword')
    .isString()
    .withMessage('newPassword must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('newPassword should not be empty')
    .bail()
    .isLength({ min: 6, max: 20 })
    .withMessage('newPassword should be between 6 and 20 characters'),
  body('recoveryCode')
    .isString()
    .withMessage('recoveryCode must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('recoveryCode should not be empty')
    .bail()
    .isUUID()
    .withMessage('recoveryCode must be a valid UUID'),
  handleValidationErrors,
];
