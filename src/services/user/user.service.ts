import { Types, UpdateWriteOpResult } from 'mongoose'
import { UserModel } from '../../models'

class UserService {
  createUser(user) {
    const userToCreate = new UserModel(user)
    return userToCreate.save()
  }

  updateUserByParams(params, update): Promise<UpdateWriteOpResult> {
    return UserModel.updateOne(params, update, { new: true }).exec()
  }

  findOneByParams(findObject) {
    return UserModel.findOne(findObject)
      .populate('businesses')
      .populate('subscription')
      .lean()
      .exec()
  }

  findById(id: string) {
    return UserModel.findById(id)
      .populate('businesses')
      .populate('subscription')
      .lean()
      .exec()
  }

  deleteById(id: string) {
    return UserModel.remove({ _id: id })
  }
}

export const userService = new UserService()
