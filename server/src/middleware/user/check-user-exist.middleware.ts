import { NextFunction, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { ErrorHandler, errors } from '../../errors'
import { userService } from '../../services'

export const checkIsUserExistMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction,
): Promise<void | NextFunction> => {
  const { email } = req.body
  const userByEmail = await userService.findOneByParams({ email })

  if (!userByEmail) {
    return next(
      new ErrorHandler(
        StatusCodes.NOT_FOUND,
        errors.USER_NOT_FOUND.message,
        errors.USER_NOT_FOUND.code,
      ),
    )
  }

  req.user = userByEmail
  next()
}
