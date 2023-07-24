import { Schema, model } from 'mongoose'

const userTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 30 * 86400 },
})

export const UserTokenModel = model('UserToken', userTokenSchema)
