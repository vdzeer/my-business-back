import { Types, UpdateWriteOpResult } from 'mongoose'
import { InventoryModel } from '../../models'

class InventoryService {
  createInventory(inventory) {
    const inventoryToCreate = new InventoryModel(inventory)
    return inventoryToCreate.save()
  }

  updateByParams(params, update): Promise<UpdateWriteOpResult> {
    return InventoryModel.updateOne(params, update, { new: true }).exec()
  }

  findOneByParams(findObject) {
    return InventoryModel.findOne(findObject).lean().exec()
  }

  findAllByParams(findObject) {
    return InventoryModel.find(findObject).lean().exec()
  }

  findById(id: string) {
    return InventoryModel.findById(id).lean().exec()
  }

  deleteById(id: string) {
    return InventoryModel.remove({ _id: id })
  }
}

export const inventoryService = new InventoryService()
