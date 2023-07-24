import { StatusCodes } from 'http-status-codes'
import * as bcrypt from 'bcrypt'
import { ErrorHandler, errors } from '../errors'
import { nodemailerService, userService } from '../services'
import { UserTokenModel } from '../models'

const axios = require('axios')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const generatePasswordToken = () => {
  return crypto.randomBytes(20).toString('hex')
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

    const userToken = await UserTokenModel.findOne({ userId: id })
    if (userToken) await userToken.remove()

    await new UserTokenModel({ userId: id, token: refreshToken }).save()
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
        subscription: null,
      })

      const newUser = await userService.findById(user._id)

      const { accessToken, refreshToken } = await generateTokens(newUser._id)

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

      const { accessToken, refreshToken } = await generateTokens(candidate._id)

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

      const { data } = await axios.post('https://oauth2.googleapis.com/token', {
        code: code,
        client_id: process.env.GOOGLE_KEY,
        client_secret: process.env.GOOGLE_SECRET,
        grant_type: 'authorization_code',
      })

      const userInfo = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        },
      )

      const candidate = await userService.findOneByParams({
        email: userInfo.data.email,
      })

      if (!candidate) {
        const user = await userService.createUser({
          ...req.body,
          provider: 'google',
          name: userInfo.data.name,
          image: '',
          businesses: [],
          subscription: null,
          email: userInfo.data.email,
        })

        const newUser = await userService.findById(user._id)

        const { accessToken, refreshToken } = await generateTokens(newUser._id)

        res.json({
          data: newUser,
          accessToken,
          refreshToken,
        })
      } else {
        const { accessToken, refreshToken } = await generateTokens(
          candidate._id,
        )

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

      const tokenResponse = await axios.post(
        'https://appleid.apple.com/auth/token',
        {
          grant_type: 'authorization_code',
          code,
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.APPLE_PRIVATE_KEY,
        },
      )

      const { id_token, user } = tokenResponse.data

      const verifiedToken = jwt.verify(
        id_token,
        process.env.APPLE_PRIVATE_KEY,
        {
          algorithms: ['ES256'],
          audience: process.env.CLIENT_ID,
          issuer: 'https://appleid.apple.com',
        },
      )

      if (verifiedToken) {
        const candidate = await userService.findOneByParams({
          email: user.email,
        })

        if (!candidate) {
          const _newUser = await userService.createUser({
            ...req.body,
            provider: 'google',
            name: user.name,
            image: '',
            businesses: [],
            subscription: null,
            email: user.email,
          })

          const newUser = await userService.findById(_newUser._id)

          const { accessToken, refreshToken } = await generateTokens(
            newUser._id,
          )

          res.json({
            data: newUser,
            accessToken,
            refreshToken,
          })
        } else {
          const { accessToken, refreshToken } = await generateTokens(
            candidate._id,
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
      const tokenExpires = Date.now() + 3600000

      const mailOptions = {
        from: 'myjob@gmail.com',
        to: email,
        subject: 'Password Recovery',
        text: 'Here is your password recovery link: ' + token,
      }

      await userService.updateUserByParams(
        { _id: user._id },
        { resetToken: token, resetTokenExpires: tokenExpires },
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
        user.resetTokenExpires < Date.now()
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
          { _id: user._id },
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
        { _id: req.userId },
        {
          ...req.body,
          ...(req?.file ? { image: req.file.filename } : {}),
        },
      )

      const updatedUser = await userService.findOneByParams({
        _id: req.userId,
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

      const user = await userService.findOneByParams({ _id: req.userId })

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
        { _id: req.userId },
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

      const user = await UserTokenModel.findOne({ token })

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

      const user = await UserTokenModel.findOne({ token })

      if (!user) return res.send({ status: 'ok' })

      await user.remove()

      res.send({ status: 'ok' })
    } catch (err) {
      return next(new ErrorHandler(err.status, err?.code, err?.message))
    }
  }
}

export const UserController = new authController()
