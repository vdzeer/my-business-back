import { StatusCodes } from 'http-status-codes'
import * as bcrypt from 'bcrypt'
import { ErrorHandler, errors } from '../errors'
import { promocodeService } from '../services'

const { ObjectId } = require('mongodb')

class promocodeController {
  async create(req, res, next) {
    try {
      const { promocode, businessId, useAmount, salePercent } = req.body

      const createPromocode = await promocodeService.createPromocode({
        promocode,
        businessId,
        useAmount,
        salePercent,
      })

      const newPromocode = await promocodeService.findById(
        ObjectId(createPromocode._id),
      )

      res.json({
        data: newPromocode,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async getAll(req, res, next) {
    try {
      const { businessId } = req.params
      const promocodes = await promocodeService.findAllByParams({ businessId })

      res.json({
        data: promocodes,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async checkPromocodeById(req, res, next) {
    try {
      const { businessId, promocodeName } = req.body
      const promocode = await promocodeService.findOneByParams({
        businessId,
        promocode: promocodeName,
      })

      res.json({
        data: promocode,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async updatePromocodeById(req, res, next) {
    try {
      const { promocodeId, promocode, useAmount, salePercent } = req.body

      await promocodeService.updateByParams(
        { _id: promocodeId },
        {
          promocode,
          useAmount,
          salePercent,
        },
      )

      const updatedPromocode = await promocodeService.findOneByParams({
        _id: promocodeId,
      })

      res.send({
        status: 'ok',
        data: updatedPromocode,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async deletePromocode(req, res, next) {
    try {
      const { promocodeId } = req.body

      await promocodeService.deleteById(promocodeId)

      res.send({
        status: 'ok',
      })
    } catch (err) {
      return next(new ErrorHandler(err.status, err?.code, err?.message))
    }
  }
}

export const PromocodeController = new promocodeController()
