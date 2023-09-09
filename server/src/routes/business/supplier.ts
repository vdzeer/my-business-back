import { Router } from 'express'
import {
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
} from '../../middleware'
import { SupplierController } from '../../controllers'

const router = Router()

router.post(
  '/create',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  SupplierController.create,
)

router.get(
  '/get-all/:businessId',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  SupplierController.getAll,
)

router.put(
  '/update',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  SupplierController.updateSupplierById,
)

router.delete(
  '/delete',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  SupplierController.deleteSupplier,
)

export const supplierRouter = router
