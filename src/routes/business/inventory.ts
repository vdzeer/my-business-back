import { Router } from 'express'
import { checkAccessTokenMiddleware } from '../../middleware'
import { InventoryController } from '../../controllers'
import { fileLoaderService } from '../../services'

const router = Router()

router.post(
  '/create',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  InventoryController.create,
)

router.get(
  '/get-all/:businessId',
  checkAccessTokenMiddleware,
  InventoryController.getAll,
)

router.put(
  '/update',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  InventoryController.updateInventoryById,
)

router.delete(
  '/delete',
  checkAccessTokenMiddleware,
  InventoryController.deleteInventory,
)

export const inventoryRouter = router
