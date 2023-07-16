import { StatusCodes } from 'http-status-codes'
import * as Multer from 'multer'

import { ErrorHandler } from '../errors'

const storage = Multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const type = file.mimetype.split('/')[1]
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + type)
  },
})

const multer = Multer({
  storage,
  limits: 20 * 1e6, // 20 mb
})

class FileLoaderService {
  file(name, types, required = true) {
    return (req, res, next) => {
      multer.single(name)(req, res, err => {
        if (err) {
          return next(new ErrorHandler(StatusCodes.BAD_REQUEST, err))
        }
        next()
      })
    }
  }
}

export const fileLoaderService = new FileLoaderService()
