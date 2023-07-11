import { Schema, model } from 'mongoose'

const inventorySchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String },
  image: { type: String },
  amount: { type: Number },
  lowerRange: { type: Number },
})

export const InventoryModel = model('Inventory', inventorySchema)
