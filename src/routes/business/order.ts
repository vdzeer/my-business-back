import { Router } from 'express'
import {
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
} from '../../middleware'
import { OrderController } from '../../controllers'

const router = Router()

router.post(
  '/create',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  OrderController.create,
)

router.get(
  '/get-all/:businessId',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  OrderController.getAll,
)

router.delete(
  '/delete',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  OrderController.deleteOrder,
)

export const orderRouter = router
