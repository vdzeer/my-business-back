import { Router } from 'express'
import { checkAccessTokenMiddleware } from '../../middleware'
import { ProductController } from '../../controllers'
import { fileLoaderService } from '../../services'

const router = Router()

router.post(
  '/create',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  ProductController.create,
)

router.get('/get-all', checkAccessTokenMiddleware, ProductController.getAll)

router.put(
  '/update',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  ProductController.updateProductById,
)

router.delete(
  '/delete',
  checkAccessTokenMiddleware,
  ProductController.deleteProduct,
)

export const productRouter = router
