import { StatusCodes } from 'http-status-codes'
import * as bcrypt from 'bcrypt'
import { ErrorHandler, errors } from '../errors'

import { productService, userService } from '../services'

class productController {
  async create(req, res, next) {
    try {
      const { businessId, categoryId, name, price, selfPrice, inventories } =
        req.body

      const product = await productService.createProduct({
        businessId,
        categoryId,
        name,
        price,
        selfPrice,
        inventories,
        ...(req?.file ? { image: req.file.filename } : {}),
      })

      const newProduct = await productService.findById(product._id)

      res.json({
        data: newProduct,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async getAll(req, res, next) {
    try {
      let businessId = req.query.businessId
      let categoryId = req.query.categoryId

      console.log(businessId, categoryId)

      const products = await productService.findAllByParams({
        businessId,
        ...(categoryId ? { categoryId } : {}),
      })

      res.json({
        data: products,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async updateProductById(req, res, next) {
    try {
      const { productId, name, price, selfPrice, inventories } = req.body

      await productService.updateByParams(
        { _id: productId },
        {
          name,
          price,
          selfPrice,
          inventories: inventories?.length ? inventories : [],
          ...(req?.file ? { image: req.file.filename } : {}),
        },
      )

      const updatedProduct = await productService.findOneByParams({
        _id: productId,
      })

      res.send({
        status: 'ok',
        data: updatedProduct,
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