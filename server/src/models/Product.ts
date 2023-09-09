import { Schema, model } from 'mongoose'

const productSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  image: { type: String },
  name: { type: String },
  price: { type: Number },
  selfPrice: { type: Number },
  inventories: [{ type: Schema.Types.ObjectId, ref: 'Inventory' }],
})

export const ProductModel = model('Product', productSchema)
