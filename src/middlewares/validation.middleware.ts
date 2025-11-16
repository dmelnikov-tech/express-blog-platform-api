import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { HTTP_STATUSES } from "../constants/http-statuses.js";

// error handler
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUSES.BAD_REQUEST).send({
      errorsMessages: errors.array().map((error) => {
        const fieldError = error as { path?: string; param?: string }; //  в express-validator v7 имя поля с ошибкой может быть в path или param в зависимости от типа ошибки.
        return {
          message: error.msg,
          field: fieldError.path || fieldError.param || "",
        };
      }),
    });
  }
  next();
};

// validation rules
export const blogValidationMiddleware = [
  body("name")
    .isString()
    .withMessage("name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("name should not be empty")
    .bail()
    .isLength({ max: 15 })
    .withMessage("name should not be longer than 15 characters"),
  body("description")
    .isString()
    .withMessage("description must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("description should not be empty")
    .bail()
    .isLength({ max: 500 })
    .withMessage("description should not be longer than 500 characters"),
  body("websiteUrl")
    .isString()
    .withMessage("websiteUrl must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("websiteUrl should not be empty")
    .bail()
    .isLength({ max: 100 })
    .withMessage("websiteUrl should not be longer than 100 characters")
    .bail()
    .isURL()
    .withMessage("websiteUrl must be a valid URL"),
  handleValidationErrors,
];
