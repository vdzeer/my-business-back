import { Types, UpdateWriteOpResult } from 'mongoose'
import { CategoryModel } from '../../models'

class CategoryService {
  createCategory(category) {
    const categoryToCreate = new CategoryModel(category)
    return categoryToCreate.save()
  }

  updateByParams(params, update): Promise<UpdateWriteOpResult> {
    return CategoryModel.updateOne(params, update, { new: true }).exec()
  }

  findOneByParams(findObject) {
    return CategoryModel.findOne(findObject).lean().exec()
  }

  findAllByParams(findObject) {
    return CategoryModel.find(findObject).lean().exec()
  }

  findById(id: string) {
    return CategoryModel.findById(id).lean().exec()
  }

  deleteById(id: string) {
    return CategoryModel.remove({ _id: id })
  }
}

export const categoryService = new CategoryService()
