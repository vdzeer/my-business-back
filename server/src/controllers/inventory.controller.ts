import { StatusCodes } from 'http-status-codes'
import * as bcrypt from 'bcrypt'
import { ErrorHandler, errors } from '../errors'
import { inventoryService, userService } from '../services'

const { ObjectId } = require('mongodb')

class inventoryController {
  async create(req, res, next) {
    try {
      const { name, businessId, amount, lowerRange } = req.body

      const inventory = await inventoryService.createInventory({
        businessId,
        name,
        amount,
        lowerRange,
        ...(req?.file ? { image: req.file.filename } : {}),
      })

      const newInventory = await inventoryService.findById(
        ObjectId(inventory._id),
      )

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
      const inventories = await inventoryService.findAllByParams({ businessId })

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
        { _id: inventoryId },
        {
          name,
          amount,
          lowerRange,
          ...(req?.file ? { image: req.file.filename } : {}),
        },
      )

      const updatedInventory = await inventoryService.findOneByParams({
        _id: inventoryId,
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
