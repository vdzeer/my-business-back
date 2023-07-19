import { Router } from 'express'
import { checkAccessTokenMiddleware } from '../../middleware'
import { BusinessController } from '../../controllers'
import { fileLoaderService } from '../../services'

const router = Router()

router.post(
  '/create',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  BusinessController.create,
)

router.post('/login', checkAccessTokenMiddleware, BusinessController.login)

router.put(
  '/update',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  BusinessController.updateBusinessById,
)

router.delete(
  '/delete',
  checkAccessTokenMiddleware,
  BusinessController.deleteBusiness,
)

export const businessRouter = router
