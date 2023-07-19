import { Router } from 'express'
import { checkAccessTokenMiddleware } from '../../middleware'
import { CategoryController } from '../../controllers'
import { fileLoaderService } from '../../services'

const router = Router()

router.post(
  '/create',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  CategoryController.create,
)

router.get(
  '/get-all/:businessId',
  checkAccessTokenMiddleware,
  CategoryController.getAll,
)

router.put(
  '/update',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  CategoryController.updateCategoryById,
)

router.delete(
  '/delete',
  checkAccessTokenMiddleware,
  CategoryController.deleteCategory,
)

export const categoryRouter = router
