import { ErrorHandler, errors } from '../errors'

import {
  inventoryService,
  orderService,
  productService,
  userService,
} from '../services'

class analyticsController {
  async getAll(req, res, next) {
    try {
      let businessId = req.query.businessId
      let date = req.query.date

      const curr = new Date(date)
      const first = curr.getDate() - curr.getDay()
      const startDate = new Date(curr.setDate(first))
      const endDate = new Date(curr.setDate(first + 6))

      const orders = await orderService.findAllByDate({
        business_id: businessId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })

      const newOrders = await Promise.all(
        orders.map(async order => {
          const products = await Promise.all(
            order.products.map(async el => {
              const product = await productService.findById(el)

              const inventories = await Promise.all(
                product.inventories.map(async item => {
                  const inv = await inventoryService.findById(item)
                  return inv
                }),
              )

              return { ...product, inventories }
            }),
          )

          return { ...order, products }
        }),
      )

      const parsedData = {}

      newOrders.forEach(item => {
        const date = new Date(item.date).toISOString().slice(0, 10)
        const selfPrice = item.products.reduce(
          // @ts-ignore
          (total, item) => +total + +item.self_price,
          0,
        )

        if (parsedData[date]) {
          parsedData[date] = {
            total: +parsedData[date].total + +item.total_price,
            self: +parsedData[date].self + +selfPrice,
          }
        } else {
          parsedData[date] = {
            total: +item.total_price,
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
