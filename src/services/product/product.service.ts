import { Types, UpdateWriteOpResult } from 'mongoose'
import { ProductModel } from '../../models'

class ProductService {
  createProduct(product) {
    const productToCreate = new ProductModel(product)
    return productToCreate.save()
  }

  updateByParams(params, update): Promise<UpdateWriteOpResult> {
    return ProductModel.updateOne(params, update, { new: true }).exec()
  }

  findOneByParams(findObject) {
    return ProductModel.findOne(findObject)
      .populate('inventories')
      .lean()
      .exec()
  }

  findAllByParams(findObject) {
    return ProductModel.find(findObject).populate('inventories').lean().exec()
  }

  findById(id: string) {
    return ProductModel.findById(id).populate('inventories').lean().exec()
  }

  deleteById(id: string) {
    return ProductModel.remove({ _id: id })
  }
}

export const productService = new ProductService()
