import { StatusCodes } from 'http-status-codes'
import * as bcrypt from 'bcrypt'
import { ErrorHandler, errors } from '../errors'
import { nodemailerService, userService } from '../services'

const axios = require('axios')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const generatePasswordToken = () => {
  return crypto.randomBytes(20).toString('hex')
}

const generateAccessToken = id => {
  const payload = {
    id,
  }
  return jwt.sign(payload, process.env.MONGODB_URL, { expiresIn: '100h' })
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

      const token = generateAccessToken(newUser._id)

      res.json({
        data: newUser,
        token,
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
      const token = generateAccessToken(candidate._id)

      res.json({
        data: candidate,
        token,
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

        const token = generateAccessToken(newUser._id)

        res.json({
          data: newUser,
          token,
        })
      } else {
        const token = generateAccessToken(candidate._id)

        res.json({
          data: candidate,
          token,
        })
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
}

export const UserController = new authController()
