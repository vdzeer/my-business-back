import { MongoError } from 'mongodb'
import { ErrorHandler } from '../errors'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'

function mongoError(err, res) {
  if (err.message === 11000) {
    res.status(StatusCodes.BAD_REQUEST).send({
      code: 'REPEAT_VALUES',
      values: err.keyValue,
    })
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: 'Error',
      message: 'Critical unresolved error',
      code: 'UNRESOLVED_ERROR',
      type: 'mongo',
    })
  }
}

export const errorHandler = (err, req, res, next) => {
  console.log('err', err)
  if (err instanceof ErrorHandler) {
    console.log('err', err)

    return res.status(err.status ? err.status : 400).send({
      message: err?.message,
      code: err.code,
    })
  }
  if (err instanceof MongoError || err.message === 11000) {
    return mongoError(err, res)
  } else {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR,
      )
  }
}
