import { StatusCodes } from 'http-status-codes'
import * as bcrypt from 'bcrypt'
import { ErrorHandler, errors } from '../errors'
import { businessService, nodemailerService, userService } from '../services'

const crypto = require('crypto')

class businessController {
  async getBusinesses(businesses) {
    try {
      const fizInfos = await Promise.all(
        businesses.map(async item => {
          const biz = await businessService.findById(item)

          const workers = biz?.workers?.length
            ? await Promise.all(
                biz?.workers.map(async item => {
                  const user = await userService.findById(item)
                  return user
                }),
              )
            : []

          return { ...biz, workers }
        }),
      )

      return fizInfos
    } catch (err) {
      return []
    }
  }

  async create(req, res, next) {
    try {
      const { userId } = req
      const { name, password, currency } = req.body

      const hashPassword = await bcrypt.hash(password, 12)

      const businessId = await businessService.createBusiness({
        userId,
        name,
        password: hashPassword,
        workers: [],
        currency,
        ...(req?.file ? { image: req.file.filename } : {}),
      })

      const user = await userService.findOneByParams({
        id: req.userId,
      })

      await userService.updateUserByParams(
        { id: req.userId },
        {
          businesses: [businessId, ...(user?.businesses ?? [])],
        },
      )

      const newBusiness = await businessService.findById(businessId)

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

      const workers = currentBusiness?.workers?.length
        ? await Promise.all(
            currentBusiness?.workers.map(async item => {
              const user = await userService.findById(item)
              return user
            }),
          )
        : []

      res.json({
        data: { ...currentBusiness, workers },
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

      const userId = await userService.createUser({
        provider: 'email',
        password: hashPassword,
        role: 'worker',
        name,
        email,
        image: '',
        businesses: [businessId],
        subscription: 1,
      })

      const newUser = await userService.findById(userId)

      const business = await businessService.findOneByParams({
        id: businessId,
      })

      await businessService.updateByParams(
        { id: businessId },
        {
          workers: [
            ...(business?.workers ? business?.workers : []),
            newUser.id,
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
        data: newUser,
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

      if (candidate.businesses.findIndex(el => el.id === businessId) !== -1) {
        return next(
          new ErrorHandler(
            StatusCodes.BAD_REQUEST,
            errors.USER_ALREADY_IN_BUSINESS.message,
            errors.USER_ALREADY_IN_BUSINESS.code,
          ),
        )
      }

      await userService.updateUserByParams(
        { id: candidate.id },
        {
          businesses: candidate?.businesses
            ? [...candidate.businesses.map(el => el.id), businessId]
            : [businessId],
        },
      )

      const business = await businessService.findOneByParams({
        id: businessId,
      })

      await businessService.updateByParams(
        { id: businessId },
        {
          workers: [
            ...(business?.workers ? business?.workers : []),
            candidate.id,
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
        data: candidate,
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

      if (candidate.businesses.findIndex(el => +el === +businessId) === -1) {
        return next(
          new ErrorHandler(
            StatusCodes.BAD_REQUEST,
            errors.USER_NOT_IN_BUSINESS.message,
            errors.USER_NOT_IN_BUSINESS.code,
          ),
        )
      }

      await userService.updateUserByParams(
        { id: candidate.id },
        {
          businesses: candidate?.businesses.filter(
            el => !(+el === +businessId),
          ),
        },
      )

      const business = await businessService.findOneByParams({
        id: businessId,
      })

      await businessService.updateByParams(
        { id: businessId },
        {
          workers: business.workers.filter(el => !(+el === +candidate.id)),
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
        { id: businessId },
        {
          name,
          currency,
          ...(req?.file ? { image: req.file.filename } : {}),
        },
      )

      const updatedBusiness = await businessService.findOneByParams({
        id: businessId,
      })

      const workers = updatedBusiness?.workers?.length
        ? await Promise.all(
            updatedBusiness?.workers.map(async item => {
              const user = await userService.findById(item)
              return user
            }),
          )
        : []

      res.send({
        status: 'ok',
        data: { ...updatedBusiness, workers },
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
        id: req.userId,
      })

      await userService.updateUserByParams(
        { id: req.userId },
        {
          businesses: user.businesses.filter(el => +el !== +businessId),
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
