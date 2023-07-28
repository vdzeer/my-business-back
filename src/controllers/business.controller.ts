import { StatusCodes } from 'http-status-codes'
import * as bcrypt from 'bcrypt'
import { ErrorHandler, errors } from '../errors'
import { businessService, nodemailerService, userService } from '../services'

const crypto = require('crypto')
const { ObjectId } = require('mongodb')

class businessController {
  async create(req, res, next) {
    try {
      const { userId } = req
      const { name, password, currency } = req.body

      const hashPassword = await bcrypt.hash(password, 12)

      const business = await businessService.createBusiness({
        userId,
        name,
        password: hashPassword,
        workers: [],
        currency,
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

  async addUser(req, res, next) {
    try {
      const { businessId, name, email } = req.body

      const candidate = await userService.findOneByParams({ email })

      if (candidate) {
        return next(
          new ErrorHandler(
            StatusCodes.BAD_REQUEST,
            errors.USER_ALREADY_EXIST.message,
            errors.USER_ALREADY_EXIST.code,
          ),
        )
      }

      const newPassword = crypto.randomBytes(20).toString('hex')

      const hashPassword = await bcrypt.hash(newPassword, 12)

      const user = await userService.createUser({
        provider: 'email',
        password: hashPassword,
        role: 'worker',
        name,
        email,
        image: '',
        businesses: [businessId],
        subscription: null,
      })

      const newUser = await userService.findById(user._id)

      const business = await businessService.findOneByParams({
        _id: businessId,
      })

      await businessService.updateByParams(
        { _id: businessId },
        {
          workers: [
            ...(business?.workers ? business?.workers : []),
            newUser._id,
          ],
        },
      )

      const mailOptions = {
        from: 'myjob@gmail.com',
        to: email,
        subject: 'Invitation to business',
        html: `<html>
      <head>
        <title>You have been invited to ${business.name}</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f2f2;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <tr>
                  <td align="center" bgcolor="#ffffff" style="padding: 40px;">
                    <h3 style="margin: 0;">Email: ${email}</h3>
                    <h3 style="margin: 0; margin-top: 10px;">Password: ${newPassword}</h3>

                    <table cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                      <tr>
                        <td align="center" bgcolor="#ffffff" style="padding: 10px;">
                          <a href="https://apps.apple.com/us/app/my-business-plus/id6450748989" style="background-color: #3498db; color: #ffffff; display: inline-block; font-size: 16px; padding: 10px 20px; text-decoration: none;">Download the App</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>`,
      }

      await nodemailerService(mailOptions)

      res.send({
        status: 'ok',
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async inviteUser(req, res, next) {
    try {
      const { businessId, email } = req.body

      const candidate = await userService.findOneByParams({ email })

      if (!candidate) {
        return next(
          new ErrorHandler(
            StatusCodes.BAD_REQUEST,
            errors.USER_NOT_FOUND.message,
            errors.USER_NOT_FOUND.code,
          ),
        )
      }

      if (
        candidate.businesses.findIndex(el =>
          ObjectId(el._id).equals(ObjectId(businessId)),
        ) !== -1
      ) {
        return next(
          new ErrorHandler(
            StatusCodes.BAD_REQUEST,
            errors.USER_ALREADY_IN_BUSINESS.message,
            errors.USER_ALREADY_IN_BUSINESS.code,
          ),
        )
      }

      await userService.updateUserByParams(
        { _id: candidate._id },
        {
          businesses: candidate?.businesses
            ? [...candidate.businesses.map(el => el._id), businessId]
            : [businessId],
        },
      )

      const business = await businessService.findOneByParams({
        _id: businessId,
      })

      await businessService.updateByParams(
        { _id: businessId },
        {
          workers: [
            ...(business?.workers ? business?.workers : []),
            candidate._id,
          ],
        },
      )

      const mailOptions = {
        from: 'myjob@gmail.com',
        to: email,
        subject: 'Invitation to business',
        html: `<html>
      <head>
        <title>You have been invited to ${business.name}</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f2f2;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <tr>
                  <td align="center" bgcolor="#ffffff" style="padding: 40px;">
                    <h3 style="margin: 0;">You have been invited to ${business.name}</h3>

                    <table cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                      <tr>
                        <td align="center" bgcolor="#ffffff" style="padding: 10px;">
                          <a href="https://apps.apple.com/us/app/my-business-plus/id6450748989" style="background-color: #3498db; color: #ffffff; display: inline-block; font-size: 16px; padding: 10px 20px; text-decoration: none;">Open the App</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>`,
      }

      await nodemailerService(mailOptions)

      res.send({
        status: 'ok',
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { businessId, email } = req.body

      const candidate = await userService.findOneByParams({ email })

      if (!candidate) {
        return next(
          new ErrorHandler(
            StatusCodes.BAD_REQUEST,
            errors.USER_NOT_FOUND.message,
            errors.USER_NOT_FOUND.code,
          ),
        )
      }

      if (
        candidate.businesses.findIndex(el =>
          ObjectId(el._id).equals(ObjectId(businessId)),
        ) === -1
      ) {
        return next(
          new ErrorHandler(
            StatusCodes.BAD_REQUEST,
            errors.USER_NOT_IN_BUSINESS.message,
            errors.USER_NOT_IN_BUSINESS.code,
          ),
        )
      }

      await userService.updateUserByParams(
        { _id: candidate._id },
        {
          businesses: candidate?.businesses.filter(
            el => !ObjectId(el._id).equals(ObjectId(businessId)),
          ),
        },
      )

      const business = await businessService.findOneByParams({
        _id: businessId,
      })

      await businessService.updateByParams(
        { _id: businessId },
        {
          workers: business.workers.filter(
            el => !ObjectId(el._id).equals(ObjectId(candidate._id)),
          ),
        },
      )

      res.send({
        status: 'ok',
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async updateBusinessById(req, res, next) {
    try {
      const { businessId, name, currency } = req.body

      await businessService.updateByParams(
        { _id: businessId },
        {
          name,
          currency,
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
