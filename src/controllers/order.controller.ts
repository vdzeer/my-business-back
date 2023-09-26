import { ErrorHandler, errors } from '../errors'

import {
  orderService,
  productService,
  promocodeService,
  inventoryService,
} from '../services'

class orderController {
  async create(req, res, next) {
    try {
      const { userId } = req

      const { businessId, payType, products, promocodeId } = req.body

      const parsedProducts = await Promise.all(
        products.map(async el => {
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

      let totalPrice = parsedProducts.reduce(
        (total, item) => total + item.price,
        0,
      )

      if (promocodeId) {
        const promocode = await promocodeService.findById(promocodeId)

        if (promocode && promocode.use_amount > 0) {
          const { sale_percent } = promocode
          totalPrice = totalPrice - (totalPrice * sale_percent) / 100

          await promocodeService.updateByParams(
            { id: promocodeId },
            {
              use_amount: promocode.use_amount - 1,
            },
          )
        }
      }

      for (let index = 0; index < parsedProducts.length; index++) {
        const product = parsedProducts[index]

        if (product.inventories?.length) {
          for (let y = 0; y < product.inventories?.length; y++) {
            const inventory = product.inventories[y]
            await inventoryService.updateByParams(
              { id: inventory.id },
              {
                amount: inventory.amount - 1,
              },
            )
          }
        }
      }

      const order = await orderService.createOrder({
        business_id: businessId,
        pay_type: payType,
        user_id: userId,
        products: parsedProducts.map(el => el.id),
        date: new Date(),
        total_price: totalPrice,
        promocode_id: promocodeId,
      })

      const newOrder = await orderService.findById(order)

      const newOrder_ParsedProducts = await Promise.all(
        newOrder.products.map(async el => {
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

      res.json({
        data: { ...newOrder, products: newOrder_ParsedProducts },
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

      res.json({
        data: newOrders,
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
