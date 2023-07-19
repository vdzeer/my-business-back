import { Types, UpdateWriteOpResult } from 'mongoose'
import { BusinessModel } from '../../models'

class BusinessService {
  createBusiness(business) {
    const businessToCreate = new BusinessModel(business)
    return businessToCreate.save()
  }

  updateByParams(params, update): Promise<UpdateWriteOpResult> {
    return BusinessModel.updateOne(params, update, { new: true }).exec()
  }

  findOneByParams(findObject) {
    return BusinessModel.findOne(findObject).populate('workers').lean().exec()
  }

  findById(id: string) {
    return BusinessModel.findById(id).populate('workers').lean().exec()
  }

  deleteById(id: string) {
    return BusinessModel.remove({ _id: id })
  }
}

export const businessService = new BusinessService()
