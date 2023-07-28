import { Schema, model } from 'mongoose'

const userSchema = new Schema({
  businesses: [{ type: Schema.Types.ObjectId, ref: 'Business' }],
  role: { type: String, enum: ['creator', 'worker'], required: true },
  subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' },
  language: { type: String },
  provider: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  name: { type: String },
  image: { type: String },
  resetToken: { type: String },
  resetTokenExpires: { type: Date },
})

export const UserModel = model('User', userSchema)
