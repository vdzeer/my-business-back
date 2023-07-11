import { Router } from 'express'
import {
  checkIsValidRegistrationMiddleware,
  checkIsValidLoginMiddleware,
  checkIsUserExistMiddleware,
} from '../../middleware'

import { UserController } from '../../controllers'

const router = Router()

router.post(
  '/registration',
  checkIsValidRegistrationMiddleware,
  UserController.registration,
)
router.post(
  '/login',
  checkIsValidLoginMiddleware,
  checkIsUserExistMiddleware,
  UserController.login,
)

export const authRouter = router
