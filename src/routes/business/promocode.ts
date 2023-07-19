import { Router } from 'express'
import { checkAccessTokenMiddleware } from '../../middleware'
import { PromocodeController } from '../../controllers'

const router = Router()

router.post('/create', checkAccessTokenMiddleware, PromocodeController.create)

router.get(
  '/get-all/:businessId',
  checkAccessTokenMiddleware,
  PromocodeController.getAll,
)

router.put(
  '/update',
  checkAccessTokenMiddleware,
  PromocodeController.updatePromocodeById,
)

router.delete(
  '/delete',
  checkAccessTokenMiddleware,
  PromocodeController.deletePromocode,
)

export const promocodeRouter = router
