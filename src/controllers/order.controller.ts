import { StatusCodes } from 'http-status-codes'
import * as bcrypt from 'bcrypt'
import { ErrorHandler, errors } from '../errors'

import {
  orderService,
  productService,
  promocodeService,
  inventoryService,
} from '../services'

const { ObjectId } = require('mongodb')

class orderController {
  async create(req, res, next) {
    try {
      const { userId } = req

      const { businessId, payType, products, promocodeId } = req.body

      const parsedProducts = await productService.findMore(products)

      const _products = products
        .map(el =>
          parsedProducts.find(parsed =>
            ObjectId(parsed._id).equals(ObjectId(el)),
          ),
        )
        .filter(el => !!el)

      let totalPrice = _products.reduce((total, item) => total + item.price, 0)

      if (promocodeId) {
        const promocode = await promocodeService.findById(promocodeId)

        if (promocode && promocode.useAmount > 0) {
          const { salePercent } = promocode
          totalPrice = totalPrice - (totalPrice * salePercent) / 100

          await promocodeService.updateByParams(
            { _id: promocodeId },
            {
              useAmount: promocode.useAmount - 1,
            },
          )
        }
      }

      for (let index = 0; index < _products.length; index++) {
        const product = _products[index]

        if (product.inventories?.length) {
          for (let y = 0; y < product.inventories?.length; y++) {
            const inventory = product.inventories[y]
            await inventoryService.updateByParams(
              { _id: inventory._id },
              {
                amount: inventory.amount - 1,
              },
            )
          }
        }
      }

      const order = await orderService.createOrder({
        businessId,
        payType,
        user: userId,
        products: _products.map(el => el._id),
        date: new Date(),
        totalPrice,
        promocodeId,
      })

      const newOrder = await orderService.findById(ObjectId(order._id))

      res.json({
        data: newOrder,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async getAll(req, res, next) {
    try {
      const { businessId } = req.params
      let date = req.query.date

      const startDate = new Date(date)
      const endDate = new Date(new Date().setDate(startDate.getDate() + 1))

      const orders = await orderService.findAllByParams({
        businessId,
        date: {
          $gte: startDate.toISOString(),
          $lt: endDate.toISOString(),
        },
      })

      res.json({
        data: orders,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async deleteOrder(req, res, next) {
    try {
      const { orderId } = req.body

      await orderService.deleteById(orderId)

      res.send({
        status: 'ok',
      })
    } catch (err) {
      return next(new ErrorHandler(err.status, err?.code, err?.message))
    }
  }
}

export const OrderController = new orderController()
