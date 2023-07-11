import { Schema, model } from 'mongoose'

const subscriptionSchema = new Schema({
  subscriptionName: { type: String },
  businessLength: { type: Number },
  productLength: { type: Number },
  inventoriesLength: { type: Number },
  suppliersLength: { type: Number },
  usersLength: { type: Number },
})

export const SubscriptionModel = model('Subscription', subscriptionSchema)
