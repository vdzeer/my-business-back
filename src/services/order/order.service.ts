import { Types, UpdateWriteOpResult } from 'mongoose'
import { OrderModel } from '../../models'

class OrderService {
  createOrder(order) {
    const orderToCreate = new OrderModel(order)
    return orderToCreate.save()
  }

  updateByParams(params, update): Promise<UpdateWriteOpResult> {
    return OrderModel.updateOne(params, update, { new: true }).exec()
  }

  findOneByParams(findObject) {
    return OrderModel.findOne(findObject)
      .populate('products')
      .populate('businessId')
      .populate('promocodeId')
      .lean()
      .exec()
  }

  findAllByParams(findObject) {
    return OrderModel.find(findObject)
      .populate('products')
      .populate('businessId')
      .populate('promocodeId')
      .lean()
      .exec()
  }

  findById(id: string) {
    return OrderModel.findById(id)
      .populate('products')
      .populate('businessId')
      .populate('promocodeId')
      .lean()
      .exec()
  }

  deleteById(id: string) {
    return OrderModel.remove({ _id: id })
  }
}

export const orderService = new OrderService()
