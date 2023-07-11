import { Router } from 'express'
import { checkAccessTokenMiddleware } from '../../middleware'
import { UserController } from '../../controllers'

const router = Router()

router.post(
  '/update',
  checkAccessTokenMiddleware,
  UserController.updateUserById,
)

router.post(
  '/update-password',
  checkAccessTokenMiddleware,
  UserController.changePassword,
)

router.get('/:id', UserController.getUserById)

export const userRouter = router
