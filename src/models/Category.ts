import { Schema, model } from 'mongoose'

const categorySchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String },
  image: { type: String },
})

export const CategoryModel = model('Category', categorySchema)
