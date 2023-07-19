import { StatusCodes } from 'http-status-codes'
import * as bcrypt from 'bcrypt'
import { ErrorHandler, errors } from '../errors'
import { businessService, userService } from '../services'

class businessController {
  async create(req, res, next) {
    try {
      const { userId } = req
      const { name, password } = req.body

      const hashPassword = await bcrypt.hash(password, 12)

      const business = await businessService.createBusiness({
        userId,
        name,
        password: hashPassword,
        workers: [],
        ...(req?.file ? { image: req.file.filename } : {}),
      })

      const user = await userService.findOneByParams({
        _id: req.userId,
      })

      await userService.updateUserByParams(
        { _id: req.userId },
        {
          businesses: [business._id, ...user.businesses],
        },
      )

      const newBusiness = await businessService.findById(business._id)

      res.json({
        data: newBusiness,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async login(req, res, next) {
    try {
      const { businessId, password } = req.body
      const currentBusiness = await businessService.findById(businessId)

      if (!currentBusiness) {
        return next(
          new ErrorHandler(
            StatusCodes.NOT_FOUND,
            errors.USER_NOT_FOUND.message,
            errors.USER_NOT_FOUND.code,
          ),
        )
      }

      const validPassword = await bcrypt.compare(
        password,
        currentBusiness.password,
      )

      if (!validPassword) {
        return next(
          new ErrorHandler(
            StatusCodes.BAD_REQUEST,
            errors.INVALID_PASSWORD.message,
            errors.INVALID_PASSWORD.code,
          ),
        )
      }

      res.json({
        data: currentBusiness,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async updateBusinessById(req, res, next) {
    try {
      const { businessId, name } = req.body

      await businessService.updateByParams(
        { _id: businessId },
        {
          name,
          ...(req?.file ? { image: req.file.filename } : {}),
        },
      )

      const updatedBusiness = await businessService.findOneByParams({
        _id: businessId,
      })

      res.send({
        status: 'ok',
        data: updatedBusiness,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async deleteBusiness(req, res, next) {
    try {
      const { businessId } = req.body

      await businessService.deleteById(businessId)

      const user = await userService.findOneByParams({
        _id: req.userId,
      })

      await userService.updateUserByParams(
        { _id: req.userId },
        {
          businesses: user.businesses.filter(el => el !== businessId),
        },
      )

      res.send({
        status: 'ok',
      })
    } catch (err) {
      return next(new ErrorHandler(err.status, err?.code, err?.message))
    }
  }
}

export const BusinessController = new businessController()
