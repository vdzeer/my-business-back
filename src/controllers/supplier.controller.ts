import { ErrorHandler, errors } from '../errors'
import { supplierService } from '../services'

class supplierController {
  async create(req, res, next) {
    try {
      const { name, businessId, contact } = req.body

      const supplier = await supplierService.createSupplier({
        business_id: businessId,
        name,
        contact,
      })

      const newSupplier = await supplierService.findById(supplier)

      res.json({
        data: newSupplier,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async getAll(req, res, next) {
    try {
      const { businessId } = req.params
      const suppliers = await supplierService.findAllByParams({
        business_id: businessId,
      })

      res.json({
        data: suppliers,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async updateSupplierById(req, res, next) {
    try {
      const { supplierId, name, contact } = req.body

      await supplierService.updateByParams(
        { id: supplierId },
        {
          name,
          contact,
        },
      )

      const updatedSupplier = await supplierService.findOneByParams({
        id: supplierId,
      })

      res.send({
        status: 'ok',
        data: updatedSupplier,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async deleteSupplier(req, res, next) {
    try {
      const { supplierId } = req.body

      await supplierService.deleteById(supplierId)

      res.send({
        status: 'ok',
      })
    } catch (err) {
      return next(new ErrorHandler(err.status, err?.code, err?.message))
    }
  }
}

export const SupplierController = new supplierController()
