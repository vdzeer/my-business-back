import { StatusCodes } from 'http-status-codes'
import * as bcrypt from 'bcrypt'
import { ErrorHandler, errors } from '../errors'
import { nodemailerService, userService } from '../services'
import { UserTokenModel } from '../models'

const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const jwksClient = require('jwks-rsa')
const { OAuth2Client } = require('google-auth-library')

const client = new OAuth2Client(process.env.GOOGLE_KEY)

const generatePasswordToken = () => {
  return crypto.randomBytes(20).toString('hex')
}

const appleClient = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys',
})

const fetchApplePublicKeys = async kid => {
  try {
    return new Promise(resolve => {
      appleClient.getSigningKey(kid, (err, key) => {
        const signingKey = key.getPublicKey()

        resolve(signingKey)
      })
    })
  } catch (error) {
    console.error('Error fetching Apple public keys:', error)
    throw error
  }
}

const generateTokens = async id => {
  try {
    const payload = {
      id,
    }

    const accessToken = jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_PRIVATE_KEY,
      { expiresIn: '1d' },
    )
    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_PRIVATE_KEY,
      { expiresIn: '30d' },
    )

    const userToken = await userService.findTokenByUser(id)
    if (userToken) await userService.deleteTokenById(id)

    await userService.createUserToken(id, refreshToken)
    return Promise.resolve({ accessToken, refreshToken })
  } catch (err) {
    return Promise.reject(err)
  }
}

class authController {
  async registration(req, res, next) {
    try {
      const { email, password } = req.body
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

      const hashPassword = await bcrypt.hash(password, 12)

      const user = await userService.createUser({
        ...req.body,
        provider: 'email',
        password: hashPassword,
        name: '',
        image: '',
        businesses: [],
        subscription: 1,
      })

      const newUser = await userService.findById(user)

      const { accessToken, refreshToken } = await generateTokens(newUser.id)

      res.json({
        data: newUser,
        accessToken,
        refreshToken,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const candidate = await userService.findOneByParams({ email })
      if (!candidate) {
        return next(
          new ErrorHandler(
            StatusCodes.NOT_FOUND,
            errors.USER_NOT_FOUND.message,
            errors.USER_NOT_FOUND.code,
          ),
        )
      }

      const validPassword = await bcrypt.compare(password, candidate.password)

      if (!validPassword) {
        return next(
          new ErrorHandler(
            StatusCodes.BAD_REQUEST,
            errors.INVALID_PASSWORD.message,
            errors.INVALID_PASSWORD.code,
          ),
        )
      }

      const { accessToken, refreshToken } = await generateTokens(candidate.id)

      res.json({
        data: candidate,
        accessToken,
        refreshToken,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async google(req, res, next) {
    try {
      const { code } = req.body

      const ticket = await client.verifyIdToken({
        idToken: code,
      })

      const payload = ticket.getPayload()

      const { email, name } = payload

      const candidate = await userService.findOneByParams({
        email,
      })

      if (!candidate) {
        const user = await userService.createUser({
          ...req.body,
          provider: 'google',
          name,
          image: '',
          businesses: [],
          subscription: '64c38bc1939ea5354c0d8fde',
          email,
          role: 'creator',
        })

        const newUser = await userService.findById(user)

        const { accessToken, refreshToken } = await generateTokens(newUser.id)

        res.json({
          data: newUser,
          accessToken,
          refreshToken,
        })
      } else {
        const { accessToken, refreshToken } = await generateTokens(candidate.id)

        res.json({
          data: candidate,
          accessToken,
          refreshToken,
        })
      }
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async apple(req, res, next) {
    try {
      const { code } = req.body

      const decodedToken = jwt.decode(code, { complete: true })

      if (!decodedToken) {
        throw new Error('Invalid token')
      }

      const { kid } = decodedToken.header

      const appleKey = await fetchApplePublicKeys(kid)

      if (!appleKey) {
        throw new Error('Apple key not found')
      }

      const options = {
        algorithms: ['RS256'],
      }

      const payload = jwt.verify(code, appleKey, options)

      if (payload.sub === decodedToken.payload.sub) {
        const email = payload.email

        const candidate = await userService.findOneByParams({
          email,
        })

        if (!candidate) {
          const _newUser = await userService.createUser({
            provider: 'apple',
            name: '',
            image: '',
            businesses: [],
            subscription: '64c38bc1939ea5354c0d8fde',
            email,
            role: 'creator',
          })

          const newUser = await userService.findById(_newUser)

          const { accessToken, refreshToken } = await generateTokens(newUser.id)

          res.json({
            data: newUser,
            accessToken,
            refreshToken,
          })
        } else {
          const { accessToken, refreshToken } = await generateTokens(
            candidate.id,
          )

          res.json({
            data: candidate,
            accessToken,
            refreshToken,
          })
        }
      } else {
        return next(
          new ErrorHandler(
            StatusCodes.BAD_REQUEST,
            errors.INJURED_TOKEN.message,
            errors.INJURED_TOKEN.code,
          ),
        )
      }
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body
      const user = await userService.findOneByParams({ email })

      if (!user) {
        return next(
          new ErrorHandler(
            StatusCodes.NOT_FOUND,
            errors.USER_NOT_FOUND.message,
            errors.USER_NOT_FOUND.code,
          ),
        )
      }

      const token = generatePasswordToken()
      const tokenExpires = Date.now() + 24 * 60 * 60 * 1000

      const mailOptions = {
        from: 'myjob@gmail.com',
        to: email,
        subject: 'Password Recovery',
        html: `<html>
    <head>
      <title>Password Recovery</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f2f2;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <tr>
                <td align="center" bgcolor="#ffffff" style="padding: 40px;">
                  <h1 style="margin: 0;">Password Recovery</h1>
                  <table cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                    <tr>
                      <td align="center" bgcolor="#ffffff" style="padding: 10px;">
                        <a href="https://my-business-react.vercel.app/?token=${token}&email=${email}" style="background-color: #3498db; color: #ffffff; display: inline-block; font-size: 16px; padding: 10px 20px; text-decoration: none;">Reset Password</a>
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

      await userService.updateUserByParams(
        { id: user.id },
        { reset_token: token, reset_token_expires: new Date(tokenExpires) },
      )

      await nodemailerService(mailOptions)

      return res.json({ status: 'ok' })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { email, token, newPassword } = req.body
      const user = await userService.findOneByParams({ email })

      if (!user) {
        return next(
          new ErrorHandler(
            StatusCodes.NOT_FOUND,
            errors.USER_NOT_FOUND.message,
            errors.USER_NOT_FOUND.code,
          ),
        )
      } else if (
        user.resetToken !== token ||
        +user.resetTokenExpires < +Date.now()
      ) {
        return next(
          new ErrorHandler(
            StatusCodes.NOT_FOUND,
            errors.INJURED_TOKEN.message,
            errors.INJURED_TOKEN.code,
          ),
        )
      } else {
        const hashPassword = await bcrypt.hash(newPassword, 12)

        await userService.updateUserByParams(
          { id: user.id },
          { resetToken: null, resetTokenExpires: null, password: hashPassword },
        )
      }

      return res.json({ status: 'ok' })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params
      const user = await userService.findById(id)

      res.send({
        status: 'ok',
        data: user,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async getMyUser(req, res, next) {
    try {
      const { userId } = req

      const user = await userService.findById(userId)

      res.send({
        status: 'ok',
        data: user,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async updateUserById(req, res, next) {
    try {
      await userService.updateUserByParams(
        { id: req.userId },
        {
          ...req.body,
          ...(req?.file ? { image: req.file.filename } : {}),
        },
      )

      const updatedUser = await userService.findOneByParams({
        id: req.userId,
      })

      res.send({
        status: 'ok',
        data: updatedUser,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async updateUserSubscription(req, res, next) {
    try {
      const { subscriptionId } = req.body

      await userService.updateUserByParams(
        { id: req.userId },
        {
          subscription: subscriptionId,
        },
      )

      const updatedUser = await userService.findOneByParams({
        id: req.userId,
      })

      res.send({
        status: 'ok',
        data: updatedUser,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async updateUserLanguage(req, res, next) {
    try {
      const { language } = req.body

      await userService.updateUserByParams(
        { id: req.userId },
        {
          language,
        },
      )

      const updatedUser = await userService.findOneByParams({
        id: req.userId,
      })

      res.send({
        status: 'ok',
        data: updatedUser,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async changePassword(req, res, next) {
    try {
      const { oldPassword, password } = req.body

      const user = await userService.findOneByParams({ id: req.userId })

      const isPasswordEquals = await bcrypt.compare(oldPassword, user.password)

      if (!isPasswordEquals) {
        return next(
          new ErrorHandler(
            StatusCodes.BAD_REQUEST,
            errors.WRONG_PASSWORD.message,
            errors.WRONG_PASSWORD.code,
          ),
        )
      }

      const hashPassword = await bcrypt.hash(password, 7)

      await userService.updateUserByParams(
        { id: req.userId },
        { password: hashPassword },
      )

      res.send({
        status: 'ok',
      })
    } catch (err) {
      return next(new ErrorHandler(err.status, err?.code, err?.message))
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { token } = req.body

      const user = await userService.findTokenByToken(token)

      if (user) {
        const payload = { id: user.userId }

        const accessToken = jwt.sign(
          payload,
          process.env.ACCESS_TOKEN_PRIVATE_KEY,
          {
            expiresIn: '24h',
          },
        )

        res.send({
          accessToken,
        })
      } else {
        return next(
          new ErrorHandler(
            StatusCodes.BAD_REQUEST,
            errors.INVALID_TOKEN.message,
            errors.INVALID_TOKEN.code,
          ),
        )
      }
    } catch (err) {
      return next(new ErrorHandler(err.status, err?.code, err?.message))
    }
  }

  async logout(req, res, next) {
    try {
      const { token } = req.body

      const user = await userService.findTokenByToken(token)

      if (!user) return res.send({ status: 'ok' })

      await userService.deleteTokenById(user.userId)

      res.send({ status: 'ok' })
    } catch (err) {
      return next(new ErrorHandler(err.status, err?.code, err?.message))
    }
  }
}

export const UserController = new authController()
