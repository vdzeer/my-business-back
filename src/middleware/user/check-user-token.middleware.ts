import { NextFunction, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { config } from '../../config'

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

    const decodedData = jwt.verify(token, config.JWT_SECRET)

    req.user = decodedData
    req.token = token
    next()
  } catch (e) {
    console.log('e', e)
    next(e)
  }
}
