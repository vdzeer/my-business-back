import { Router } from 'express'
import { checkAccessTokenMiddleware } from '../../middleware'
import { OrderController } from '../../controllers'

const router = Router()

router.post('/create', checkAccessTokenMiddleware, OrderController.create)

router.get(
  '/get-all/:businessId',
  checkAccessTokenMiddleware,
  OrderController.getAll,
)

router.delete(
  '/delete',
  checkAccessTokenMiddleware,
  OrderController.deleteOrder,
)

export const orderRouter = router
