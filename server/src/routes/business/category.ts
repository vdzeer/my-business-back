import { Router } from 'express'
import {
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
} from '../../middleware'
import { CategoryController } from '../../controllers'
import { fileLoaderService } from '../../services'

const router = Router()

router.post(
  '/create',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  CategoryController.create,
)

router.get(
  '/get-all/:businessId',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  CategoryController.getAll,
)

router.put(
  '/update',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  CategoryController.updateCategoryById,
)

router.delete(
  '/delete',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  CategoryController.deleteCategory,
)

export const categoryRouter = router
