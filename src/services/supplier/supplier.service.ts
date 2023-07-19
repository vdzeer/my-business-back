import { Types, UpdateWriteOpResult } from 'mongoose'
import { SupplierModel } from '../../models'

class SupplierService {
  createSupplier(supplier) {
    const supplierToCreate = new SupplierModel(supplier)
    return supplierToCreate.save()
  }

  updateByParams(params, update): Promise<UpdateWriteOpResult> {
    return SupplierModel.updateOne(params, update, { new: true }).exec()
  }

  findOneByParams(findObject) {
    return SupplierModel.findOne(findObject).lean().exec()
  }

  findAllByParams(findObject) {
    return SupplierModel.find(findObject).lean().exec()
  }

  findById(id: string) {
    return SupplierModel.findById(id).lean().exec()
  }

  deleteById(id: string) {
    return SupplierModel.remove({ _id: id })
  }
}

export const supplierService = new SupplierService()
