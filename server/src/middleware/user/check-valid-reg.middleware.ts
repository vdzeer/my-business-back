import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { userRegistrationValidator } from '../../validators'
import { ErrorHandler, errors } from '../../errors'

export const checkIsValidRegistrationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = userRegistrationValidator.validate(req.body)
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
