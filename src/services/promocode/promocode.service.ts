import { Types, UpdateWriteOpResult } from 'mongoose'
import { PromocodeModel } from '../../models'

class PromocodeService {
  createPromocode(promocode) {
    const promocodeToCreate = new PromocodeModel(promocode)
    return promocodeToCreate.save()
  }

  updateByParams(params, update): Promise<UpdateWriteOpResult> {
    return PromocodeModel.updateOne(params, update, { new: true }).exec()
  }

  findOneByParams(findObject) {
    return PromocodeModel.findOne(findObject).lean().exec()
  }

  findAllByParams(findObject) {
    return PromocodeModel.find(findObject).lean().exec()
  }

  findById(id: string) {
    return PromocodeModel.findById(id).lean().exec()
  }

  deleteById(id: string) {
    return PromocodeModel.remove({ _id: id })
  }
}

export const promocodeService = new PromocodeService()
