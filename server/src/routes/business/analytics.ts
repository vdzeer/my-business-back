import { Router } from 'express'
import {
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
} from '../../middleware'
import { AnalyticsController } from '../../controllers'

const router = Router()

router.get(
  '/get-all',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  AnalyticsController.getAll,
)

export const analyticsRouter = router
