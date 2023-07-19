import { Router } from 'express'
import { checkAccessTokenMiddleware } from '../../middleware'
import { SupplierController } from '../../controllers'

const router = Router()

router.post('/create', checkAccessTokenMiddleware, SupplierController.create)

router.get(
  '/get-all/:businessId',
  checkAccessTokenMiddleware,
  SupplierController.getAll,
)

router.put(
  '/update',
  checkAccessTokenMiddleware,
  SupplierController.updateSupplierById,
)

router.delete(
  '/delete',
  checkAccessTokenMiddleware,
  SupplierController.deleteSupplier,
)

export const supplierRouter = router
