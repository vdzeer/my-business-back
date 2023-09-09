import { Router } from 'express'
import {
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
} from '../../middleware'
import { BusinessController } from '../../controllers'
import { fileLoaderService } from '../../services'

const router = Router()

router.post(
  '/create',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  BusinessController.create,
)

router.post(
  '/add-user',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  BusinessController.addUser,
)

router.post(
  '/invite-user',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  BusinessController.inviteUser,
)

router.post(
  '/delete-user',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  BusinessController.deleteUser,
)

router.post(
  '/login',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  BusinessController.login,
)

router.put(
  '/update',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  BusinessController.updateBusinessById,
)

router.delete(
  '/delete',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  BusinessController.deleteBusiness,
)

export const businessRouter = router
