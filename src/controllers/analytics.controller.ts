import { StatusCodes } from 'http-status-codes'
import * as bcrypt from 'bcrypt'
import { ErrorHandler, errors } from '../errors'

import { orderService, productService, userService } from '../services'

class analyticsController {
  async getAll(req, res, next) {
    try {
      let businessId = req.query.businessId
      let date = req.query.date

      const curr = new Date(date)
      const first = curr.getDate() - curr.getDay()
      const startDate = new Date(curr.setDate(first))
      const endDate = new Date(curr.setDate(first + 6))

      const products = await orderService.findAllByParams({
        businessId,
        date: {
          $gte: startDate.toISOString(),
          $lt: endDate.toISOString(),
        },
      })

      const parsedData = {}

      products.forEach(item => {
        const date = new Date(item.date).toISOString().slice(0, 10) // Extracting only the date part from the timestamp
        const selfPrice = item.products.reduce(
          (total, item) => total + item.selfPrice,
          0,
        )

        if (parsedData[date]) {
          parsedData[date] = {
            total: parsedData[date].total + item.totalPrice,
            self: parsedData[date].self + selfPrice,
          }
        } else {
          parsedData[date] = {
            total: +item.totalPrice,
            self: +selfPrice,
          }
        }
      })

      res.json({
        data: parsedData,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }
}

export const AnalyticsController = new analyticsController()
