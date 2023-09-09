import { Router } from 'express'
import {
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
} from '../../middleware'
import { InventoryController } from '../../controllers'
import { fileLoaderService } from '../../services'

const router = Router()

router.post(
  '/create',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  InventoryController.create,
)

router.get(
  '/get-all/:businessId',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  InventoryController.getAll,
)

router.put(
  '/update',
  fileLoaderService.file('image', /image\/(png|jpeg|giff)/, false),
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  InventoryController.updateInventoryById,
)

router.delete(
  '/delete',
  checkAccessTokenMiddleware,
  checkOwnershipMiddleware,
  InventoryController.deleteInventory,
)

export const inventoryRouter = router
