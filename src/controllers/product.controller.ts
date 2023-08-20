import { StatusCodes } from 'http-status-codes'
import * as bcrypt from 'bcrypt'
import { ErrorHandler, errors } from '../errors'

import { productService, userService } from '../services'

const { ObjectId } = require('mongodb')

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

      const newProduct = await productService.findById(ObjectId(product._id))

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
      const { productId, name, price, selfPrice, inventories, categoryId } =
        req.body

      await productService.updateByParams(
        { _id: productId },
        {
          name,
          price,
          selfPrice,
          categoryId,
          inventories: inventories?.length ? inventories : [],
          ...(req?.file ? { image: req.file.filename } : {}),
        },
      )

      const updatedProduct = await productService.findById(productId)

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
