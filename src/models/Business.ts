import { Schema, model } from 'mongoose'

const businessSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  workers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  name: { type: String, required: true },
  password: { type: String, required: true },
  image: { type: String },
})

export const BusinessModel = model('Business', businessSchema)
