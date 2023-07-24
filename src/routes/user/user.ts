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

router.post('/reset-password', UserController.resetPassword)

router.post('/forget-password', UserController.forgotPassword)

router.get('/me', checkAccessTokenMiddleware, UserController.getMyUser)

router.get('/:id', checkAccessTokenMiddleware, UserController.getUserById)

router.post('/logout', UserController.logout)

export const userRouter = router
