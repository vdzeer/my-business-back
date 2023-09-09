import { NextFunction, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { ErrorHandler, errors } from '../../errors'

const jwt = require('jsonwebtoken')

export const checkAccessTokenMiddleware = async (
  req,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token = req.get('Authorization')

    token = token.split(' ')[1]

    const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_PRIVATE_KEY)

    if (decodedData) {
      req.userId = decodedData.id
      req.token = token
      return next()
    } else {
      return next(
        new ErrorHandler(
          StatusCodes.UNAUTHORIZED,
          errors.INJURED_TOKEN.message,
          errors.INJURED_TOKEN.code,
        ),
      )
    }
  } catch (e) {
    return next(
      new ErrorHandler(
        StatusCodes.UNAUTHORIZED,
        errors.INVALID_TOKEN.message,
        errors.INVALID_TOKEN.code,
      ),
    )
  }
}
