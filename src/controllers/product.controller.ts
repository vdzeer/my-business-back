import { ErrorHandler, errors } from '../errors'

import { inventoryService, productService, userService } from '../services'

class productController {
  async create(req, res, next) {
    try {
      const { businessId, categoryId, name, price, selfPrice, inventories } =
        req.body

      const product = await productService.createProduct({
        business_id: businessId,
        category_id: categoryId,
        name,
        price,
        self_price: selfPrice,
        inventories,
        ...(req?.file ? { image: req.file.filename } : {}),
      })

      const newProduct = await productService.findById(product)

      const _inventories = await Promise.all(
        newProduct.inventories.map(async item => {
          const inv = await inventoryService.findById(item)

          return inv
        }),
      )

      res.json({
        data: { ...newProduct, inventories: _inventories },
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async getAll(req, res, next) {
    try {
      let businessId = req.query.businessId
      let categoryId = req.query.categoryId

      const products = await productService.findAllByParams({
        business_id: businessId,
        ...(categoryId ? { category_id: categoryId } : {}),
      })

      const parsedProducts = await Promise.all(
        products.map(async el => {
          const inventories = await Promise.all(
            el.inventories.map(async item => {
              const inv = await inventoryService.findById(item)
              return inv
            }),
          )

          return { ...el, inventories }
        }),
      )

      res.json({
        data: parsedProducts,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async updateProductById(req, res, next) {
    try {
      const { productId, name, price, selfPrice, inventories, categoryId } =
        req.body

      await productService.updateByParams(
        { id: productId },
        {
          name,
          price,
          self_price: selfPrice,
          category_id: categoryId,
          inventories: inventories?.length ? inventories : [],
          ...(req?.file ? { image: req.file.filename } : {}),
        },
      )

      const updatedProduct = await productService.findById(productId)

      const _inventories = await Promise.all(
        updatedProduct.inventories.map(async item => {
          const inv = await inventoryService.findById(item)

          return inv
        }),
      )

      res.send({
        status: 'ok',
        data: { ...updatedProduct, inventories: _inventories },
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { productId } = req.body

      await productService.deleteById(productId)

      res.send({
        status: 'ok',
      })
    } catch (err) {
      return next(new ErrorHandler(err.status, err?.code, err?.message))
    }
  }
}

export const ProductController = new productController()
