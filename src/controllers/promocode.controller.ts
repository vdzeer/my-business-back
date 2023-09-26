import { ErrorHandler, errors } from '../errors'
import { promocodeService } from '../services'

class promocodeController {
  async create(req, res, next) {
    try {
      const { promocode, businessId, useAmount, salePercent } = req.body

      const createPromocode = await promocodeService.createPromocode({
        promocode,
        business_id: businessId,
        use_amount: useAmount,
        sale_percent: salePercent,
      })

      const newPromocode = await promocodeService.findById(createPromocode)

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
      const promocodes = await promocodeService.findAllByParams({
        business_id: businessId,
      })

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
        business_id: businessId,
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
        { id: promocodeId },
        {
          promocode,
          use_amount: useAmount,
          sale_percent: salePercent,
        },
      )

      const updatedPromocode = await promocodeService.findOneByParams({
        id: promocodeId,
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
