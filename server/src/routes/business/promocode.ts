import { Router } from 'express'
import {
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
} from '../../middleware'
import { PromocodeController } from '../../controllers'

const router = Router()

router.post(
  '/create',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  PromocodeController.create,
)

router.get(
  '/get-all/:businessId',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  PromocodeController.getAll,
)

router.post(
  '/check',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  PromocodeController.checkPromocodeById,
)

router.put(
  '/update',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  PromocodeController.updatePromocodeById,
)

router.delete(
  '/delete',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  PromocodeController.deletePromocode,
)

export const promocodeRouter = router
