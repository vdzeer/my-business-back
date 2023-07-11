import { StatusCodes } from 'http-status-codes'
import * as Multer from 'multer'
import * as path from 'path'
import * as fs from 'fs'

import { ErrorHandler } from '../errors'

const __rootDir = path.resolve(process.cwd(), './')

const storage = Multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
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
          console.log('err', err)
          return next(new ErrorHandler(StatusCodes.BAD_REQUEST, err))
        }
        console.log('req.file', req.file)
        if (!req.file) {
          if (required) {
            return next(new ErrorHandler(StatusCodes.BAD_REQUEST, err))
          } else {
            return next()
          }
        }

        let valid = true
        if (!valid) {
          console.log('valid', err)

          return next(new ErrorHandler(StatusCodes.BAD_REQUEST, err))
        }

        req.file.copy = req.copyFile = async function (to, file = req.file) {
          try {
            let filename =
              path.join(...to) +
              '_' +
              Date.now() +
              '.' +
              file.mimetype.split('/').pop()
            await copy(path.join('public', filename), file)
            filename = filename.replace('\\', '/')
            return filename
          } catch (err) {
            console.log('req.file.copy', err)
            return next(new ErrorHandler(StatusCodes.BAD_REQUEST, err))
          }
        }
        next()
      })
    }
  }
}

async function copy(to, file) {
  await new Promise<void>((resolve, reject) => {
    fs.rename(
      path.join(__rootDir, file.path),
      path.join(__rootDir, to),
      err => {
        if (err) {
          console.log('errCopy', err)
          reject(err)
          fs.unlink(path.join(__rootDir, file.path), () => {})
          return
        }
        resolve()
      },
    )
  })
}

export const fileLoaderService = new FileLoaderService()
