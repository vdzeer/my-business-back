import * as Joi from 'joi'

export const loginValidator = Joi.object({
  email: Joi.string().trim().required(),
  password: Joi.string().trim().required(),
})
