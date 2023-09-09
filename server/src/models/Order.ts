import { Schema, model } from 'mongoose'

const orderSchema = new Schema({
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  payType: { type: String },
  totalPrice: { type: Number },
  promocodeId: { type: Schema.Types.ObjectId, ref: 'Promocode' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date },
})

export const OrderModel = model('Order', orderSchema)
