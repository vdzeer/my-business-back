import { Schema, model } from 'mongoose'

const supplierSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String },
  contact: { type: String },
})

export const SupplierModel = model('Supplier', supplierSchema)
