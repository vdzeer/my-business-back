import { Schema, model } from 'mongoose'

const promocodeSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  promocode: { type: String },
  useAmount: { type: Number },
  salePercent: { type: Number },
})

export const PromocodeModel = model('Promocode', promocodeSchema)
