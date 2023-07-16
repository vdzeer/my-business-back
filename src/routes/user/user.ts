import { Router } from 'express'
import { checkAccessTokenMiddleware } from '../../middleware'
import { UserController } from '../../controllers'
import { fileLoaderService } from '../../services'

const router = Router()

router.put(
  '/update',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  UserController.updateUserById,
)

router.post(
  '/update-password',
  checkAccessTokenMiddleware,
  UserController.changePassword,
)

router.get('/me', checkAccessTokenMiddleware, UserController.getMyUser)

router.get('/:id', checkAccessTokenMiddleware, UserController.getUserById)

export const userRouter = router
