import { Router } from 'express'
import {
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
} from '../../middleware'
import { ProductController } from '../../controllers'
import { fileLoaderService } from '../../services'

const router = Router()

router.post(
  '/create',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  ProductController.create,
)

router.get(
  '/get-all',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  ProductController.getAll,
)

router.put(
  '/update',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  ProductController.updateProductById,
)

router.delete(
  '/delete',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  ProductController.deleteProduct,
)

export const productRouter = router
