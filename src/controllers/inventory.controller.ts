import { ErrorHandler, errors } from '../errors'
import { inventoryService, userService } from '../services'

class inventoryController {
  async create(req, res, next) {
    try {
      const { name, businessId, amount, lowerRange } = req.body

      const inventory = await inventoryService.createInventory({
        business_id: businessId,
        name,
        amount,
        lowerRange,
        ...(req?.file ? { image: req.file.filename } : {}),
      })

      const newInventory = await inventoryService.findById(inventory)

      res.json({
        data: newInventory,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async getAll(req, res, next) {
    try {
      const { businessId } = req.params
      const inventories = await inventoryService.findAllByParams({
        business_id: businessId,
      })

      res.json({
        data: inventories,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async updateInventoryById(req, res, next) {
    try {
      const { inventoryId, name, amount, lowerRange } = req.body

      await inventoryService.updateByParams(
        { id: inventoryId },
        {
          name,
          amount,
          ...(lowerRange ? { lower_range: lowerRange } : {}),
          ...(req?.file ? { image: req.file.filename } : {}),
        },
      )

      const updatedInventory = await inventoryService.findOneByParams({
        id: inventoryId,
      })

      res.send({
        status: 'ok',
        data: updatedInventory,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async deleteInventory(req, res, next) {
    try {
      const { inventoryId } = req.body

      await inventoryService.deleteById(inventoryId)

      res.send({
        status: 'ok',
      })
    } catch (err) {
      return next(new ErrorHandler(err.status, err?.code, err?.message))
    }
  }
}

export const InventoryController = new inventoryController()
