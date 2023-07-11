import * as Joi from 'joi'

export const userRegistrationValidator = Joi.object({
  email: Joi.string().trim().email(),
  password: Joi.string().trim().required(),
  role: Joi.string().trim().required(),
})
