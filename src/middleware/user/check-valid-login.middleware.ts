import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { loginValidator } from '../../validators'
import { ErrorHandler, errors } from '../../errors'

export const checkIsValidLoginMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = loginValidator.validate(req.body)
  if (error) {
    return next(
      new ErrorHandler(
        StatusCodes.BAD_REQUEST,
        error.details[0].message,
        errors.VALIDATION_ERROR.code,
      ),
    )
  }

  next()
}
